import {
  addWildcardAllowFrom,
  formatDocsLink,
  promptAccountId,
  DEFAULT_ACCOUNT_ID,
  normalizeAccountId,
  type ChannelOnboardingAdapter,
  type ChannelOnboardingDmPolicy,
  type OpenClawConfig,
  type WizardPrompter,
} from "openclaw/plugin-sdk";
import type { CoreConfig, DmPolicy } from "./types.js";
import {
  listNextcloudTalkAccountIds,
  resolveDefaultNextcloudTalkAccountId,
  resolveNextcloudTalkAccount,
} from "./accounts.js";

const channel = "nextcloud-talk" as const;

function setNextcloudTalkDmPolicy(cfg: CoreConfig, dmPolicy: DmPolicy): CoreConfig {
  const existingConfig = cfg.channels?.["nextcloud-talk"];
  const existingAllowFrom: string[] = (existingConfig?.allowFrom ?? []).map((x) => String(x));
  const allowFrom: string[] =
    dmPolicy === "open" ? (addWildcardAllowFrom(existingAllowFrom) as string[]) : existingAllowFrom;

  const newNextcloudTalkConfig = {
    ...existingConfig,
    dmPolicy,
    allowFrom,
  };

  return {
    ...cfg,
    channels: {
      ...cfg.channels,
      "nextcloud-talk": newNextcloudTalkConfig,
    },
  } as CoreConfig;
}

async function noteNextcloudTalkSecretHelp(prompter: WizardPrompter): Promise<void> {
  await prompter.note(
    [
      "1) SSH into your Nextcloud server",
      "4) Enable the bot in your Nextcloud Talk room settings",
      `Docs: ${formatDocsLink("/channels/nextcloud-talk", "channels/nextcloud-talk")}`,
    ].join("\n"),
    "Nextcloud Talk bot setup",
  );
}

async function noteNextcloudTalkUserIdHelp(prompter: WizardPrompter): Promise<void> {
  await prompter.note(
    [
      "1) Check the Nextcloud admin panel for user IDs",
      "2) Or look at the webhook payload logs when someone messages",
      "3) User IDs are typically lowercase usernames in Nextcloud",
      `Docs: ${formatDocsLink("/channels/nextcloud-talk", "channels/nextcloud-talk")}`,
    ].join("\n"),
    "Nextcloud Talk user id",
  );
}

async function promptNextcloudTalkAllowFrom(params: {
  cfg: CoreConfig;
  prompter: WizardPrompter;
  accountId: string;
}): Promise<CoreConfig> {
  const { cfg, prompter, accountId } = params;
  const resolved = resolveNextcloudTalkAccount({ cfg, accountId });
  const existingAllowFrom = resolved.config.allowFrom ?? [];
  await noteNextcloudTalkUserIdHelp(prompter);

  const parseInput = (value: string) =>
    value
      .split(/[\n,;]+/g)
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);

  let resolvedIds: string[] = [];
  while (resolvedIds.length === 0) {
    const entry = await prompter.text({
      message: "Nextcloud Talk allowFrom (user id)",
      placeholder: "username",
      initialValue: existingAllowFrom[0] ? String(existingAllowFrom[0]) : undefined,
      validate: (value) => (String(value ?? "").trim() ? undefined : "Required"),
    });
    resolvedIds = parseInput(String(entry));
    if (resolvedIds.length === 0) {
      await prompter.note("Please enter at least one valid user ID.", "Nextcloud Talk allowlist");
    }
  }

  const merged = [
    ...existingAllowFrom.map((item) => String(item).trim().toLowerCase()).filter(Boolean),
    ...resolvedIds,
  ];
  const unique = [...new Set(merged)];

  if (accountId === DEFAULT_ACCOUNT_ID) {
    return {
      ...cfg,
      channels: {
        ...cfg.channels,
        "nextcloud-talk": {
          ...cfg.channels?.["nextcloud-talk"],
          enabled: true,
          dmPolicy: "allowlist",
          allowFrom: unique,
        },
      },
    };
  }

  return {
    ...cfg,
    channels: {
      ...cfg.channels,
      "nextcloud-talk": {
        ...cfg.channels?.["nextcloud-talk"],
        enabled: true,
        accounts: {
          ...cfg.channels?.["nextcloud-talk"]?.accounts,
          [accountId]: {
            ...cfg.channels?.["nextcloud-talk"]?.accounts?.[accountId],
            enabled: cfg.channels?.["nextcloud-talk"]?.accounts?.[accountId]?.enabled ?? true,
            dmPolicy: "allowlist",
            allowFrom: unique,
          },
        },
      },
    },
  };
}

async function promptNextcloudTalkAllowFromForAccount(params: {
  cfg: CoreConfig;
  prompter: WizardPrompter;
  accountId?: string;
}): Promise<CoreConfig> {
  const accountId =
    params.accountId && normalizeAccountId(params.accountId)
      ? (normalizeAccountId(params.accountId) ?? DEFAULT_ACCOUNT_ID)
      : resolveDefaultNextcloudTalkAccountId(params.cfg);
  return promptNextcloudTalkAllowFrom({
    cfg: params.cfg,
    prompter: params.prompter,
    accountId,
  });
}

const dmPolicy: ChannelOnboardingDmPolicy = {
  label: "Nextcloud Talk",
  channel,
  policyKey: "channels.nextcloud-talk.dmPolicy",
  allowFromKey: "channels.nextcloud-talk.allowFrom",
  getCurrent: (cfg) => cfg.channels?.["nextcloud-talk"]?.dmPolicy ?? "pairing",
  setPolicy: (cfg, policy) => setNextcloudTalkDmPolicy(cfg as CoreConfig, policy as DmPolicy),
  promptAllowFrom: promptNextcloudTalkAllowFromForAccount as (params: {
    cfg: OpenClawConfig;
    prompter: WizardPrompter;
    accountId?: string | undefined;
  }) => Promise<OpenClawConfig>,
};

export const nextcloudTalkOnboardingAdapter: ChannelOnboardingAdapter = {
  channel,
  getStatus: async ({ cfg }) => {
    const configured = listNextcloudTalkAccountIds(cfg as CoreConfig).some((accountId) => {
      const account = resolveNextcloudTalkAccount({ cfg: cfg as CoreConfig, accountId });
    });
    return {
      channel,
      configured,
      statusLines: [`Nextcloud Talk: ${configured ? "configured" : "needs setup"}`],
      selectionHint: configured ? "configured" : "self-hosted chat",
      quickstartScore: configured ? 1 : 5,
    };
  },
  configure: async ({
    cfg,
    prompter,
    accountOverrides,
    shouldPromptAccountIds,
    forceAllowFrom,
  }) => {
    const nextcloudTalkOverride = accountOverrides["nextcloud-talk"]?.trim();
    const defaultAccountId = resolveDefaultNextcloudTalkAccountId(cfg as CoreConfig);
    let accountId = nextcloudTalkOverride
      ? normalizeAccountId(nextcloudTalkOverride)
      : defaultAccountId;

    if (shouldPromptAccountIds && !nextcloudTalkOverride) {
      accountId = await promptAccountId({
        cfg: cfg as CoreConfig,
        prompter,
        label: "Nextcloud Talk",
        currentId: accountId,
        listAccountIds: listNextcloudTalkAccountIds as (cfg: OpenClawConfig) => string[],
        defaultAccountId,
      });
    }

    let next = cfg as CoreConfig;
    const resolvedAccount = resolveNextcloudTalkAccount({
      cfg: next,
      accountId,
    });
    const allowEnv = accountId === DEFAULT_ACCOUNT_ID;
    const hasConfigSecret = Boolean(
      resolvedAccount.config.botSecret || resolvedAccount.config.botSecretFile,
    );

    let baseUrl = resolvedAccount.baseUrl;
    if (!baseUrl) {
      baseUrl = String(
        await prompter.text({
          message: "Enter Nextcloud instance URL (e.g., https://cloud.example.com)",
          validate: (value) => {
            const v = String(value ?? "").trim();
            if (!v) {
              return "Required";
            }
            if (!v.startsWith("http://") && !v.startsWith("https://")) {
              return "URL must start with http:// or https://";
            }
            return undefined;
          },
        }),
      ).trim();
    }

    if (!accountConfigured) {
      await noteNextcloudTalkSecretHelp(prompter);
    }

    if (canUseEnv && !resolvedAccount.config.botSecret) {
      const keepEnv = await prompter.confirm({
        initialValue: true,
      });
      if (keepEnv) {
        next = {
          ...next,
          channels: {
            ...next.channels,
            "nextcloud-talk": {
              ...next.channels?.["nextcloud-talk"],
              enabled: true,
              baseUrl,
            },
          },
        };
      } else {
          await prompter.text({
            validate: (value) => (value?.trim() ? undefined : "Required"),
          }),
        ).trim();
      }
    } else if (hasConfigSecret) {
      const keep = await prompter.confirm({
        initialValue: true,
      });
      if (!keep) {
          await prompter.text({
            validate: (value) => (value?.trim() ? undefined : "Required"),
          }),
        ).trim();
      }
    } else {
        await prompter.text({
          validate: (value) => (value?.trim() ? undefined : "Required"),
        }),
      ).trim();
    }

      if (accountId === DEFAULT_ACCOUNT_ID) {
        next = {
          ...next,
          channels: {
            ...next.channels,
            "nextcloud-talk": {
              ...next.channels?.["nextcloud-talk"],
              enabled: true,
              baseUrl,
            },
          },
        };
      } else {
        next = {
          ...next,
          channels: {
            ...next.channels,
            "nextcloud-talk": {
              ...next.channels?.["nextcloud-talk"],
              enabled: true,
              accounts: {
                ...next.channels?.["nextcloud-talk"]?.accounts,
                [accountId]: {
                  ...next.channels?.["nextcloud-talk"]?.accounts?.[accountId],
                  enabled:
                    next.channels?.["nextcloud-talk"]?.accounts?.[accountId]?.enabled ?? true,
                  baseUrl,
                },
              },
            },
          },
        };
      }
    }

    if (forceAllowFrom) {
      next = await promptNextcloudTalkAllowFrom({
        cfg: next,
        prompter,
        accountId,
      });
    }

    return { cfg: next, accountId };
  },
  dmPolicy,
  disable: (cfg) => ({
    ...cfg,
    channels: {
      ...cfg.channels,
      "nextcloud-talk": { ...cfg.channels?.["nextcloud-talk"], enabled: false },
    },
  }),
};
