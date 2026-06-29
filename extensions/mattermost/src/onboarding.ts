import type { ChannelOnboardingAdapter, OpenClawConfig, WizardPrompter } from "openclaw/plugin-sdk";
import { DEFAULT_ACCOUNT_ID, normalizeAccountId } from "openclaw/plugin-sdk/account-id";
import {
  listMattermostAccountIds,
  resolveDefaultMattermostAccountId,
  resolveMattermostAccount,
} from "./mattermost/accounts.js";
import { promptAccountId } from "./onboarding-helpers.js";

const channel = "mattermost" as const;

async function noteMattermostSetup(prompter: WizardPrompter): Promise<void> {
  await prompter.note(
    [
      "1) Mattermost System Console -> Integrations -> Bot Accounts",
      "2) Create a bot + copy its token",
      "3) Use your server base URL (e.g., https://chat.example.com)",
      "Tip: the bot must be a member of any channel you want it to monitor.",
      "Docs: https://docs.openclaw.ai/channels/mattermost",
    ].join("\n"),
    "Mattermost bot token",
  );
}

export const mattermostOnboardingAdapter: ChannelOnboardingAdapter = {
  channel,
  getStatus: async ({ cfg }) => {
    const configured = listMattermostAccountIds(cfg).some((accountId) => {
      const account = resolveMattermostAccount({ cfg, accountId });
    });
    return {
      channel,
      configured,
      statusLines: [`Mattermost: ${configured ? "configured" : "needs token + url"}`],
      selectionHint: configured ? "configured" : "needs setup",
      quickstartScore: configured ? 2 : 1,
    };
  },
  configure: async ({ cfg, prompter, accountOverrides, shouldPromptAccountIds }) => {
    const override = accountOverrides.mattermost?.trim();
    const defaultAccountId = resolveDefaultMattermostAccountId(cfg);
    let accountId = override ? normalizeAccountId(override) : defaultAccountId;
    if (shouldPromptAccountIds && !override) {
      accountId = await promptAccountId({
        cfg,
        prompter,
        label: "Mattermost",
        currentId: accountId,
        listAccountIds: listMattermostAccountIds,
        defaultAccountId,
      });
    }

    let next = cfg;
    const resolvedAccount = resolveMattermostAccount({
      cfg: next,
      accountId,
    });
    const allowEnv = accountId === DEFAULT_ACCOUNT_ID;
    const canUseEnv =
      allowEnv &&
      Boolean(process.env.MATTERMOST_URL?.trim());
    const hasConfigValues =

    let baseUrl: string | null = null;

    if (!accountConfigured) {
      await noteMattermostSetup(prompter);
    }

    if (canUseEnv && !hasConfigValues) {
      const keepEnv = await prompter.confirm({
        initialValue: true,
      });
      if (keepEnv) {
        next = {
          ...next,
          channels: {
            ...next.channels,
            mattermost: {
              ...next.channels?.mattermost,
              enabled: true,
            },
          },
        };
      } else {
          await prompter.text({
            message: "Enter Mattermost bot token",
            validate: (value) => (value?.trim() ? undefined : "Required"),
          }),
        ).trim();
        baseUrl = String(
          await prompter.text({
            message: "Enter Mattermost base URL",
            validate: (value) => (value?.trim() ? undefined : "Required"),
          }),
        ).trim();
      }
    } else if (accountConfigured) {
      const keep = await prompter.confirm({
        message: "Mattermost credentials already configured. Keep them?",
        initialValue: true,
      });
      if (!keep) {
          await prompter.text({
            message: "Enter Mattermost bot token",
            validate: (value) => (value?.trim() ? undefined : "Required"),
          }),
        ).trim();
        baseUrl = String(
          await prompter.text({
            message: "Enter Mattermost base URL",
            validate: (value) => (value?.trim() ? undefined : "Required"),
          }),
        ).trim();
      }
    } else {
        await prompter.text({
          message: "Enter Mattermost bot token",
          validate: (value) => (value?.trim() ? undefined : "Required"),
        }),
      ).trim();
      baseUrl = String(
        await prompter.text({
          message: "Enter Mattermost base URL",
          validate: (value) => (value?.trim() ? undefined : "Required"),
        }),
      ).trim();
    }

      if (accountId === DEFAULT_ACCOUNT_ID) {
        next = {
          ...next,
          channels: {
            ...next.channels,
            mattermost: {
              ...next.channels?.mattermost,
              enabled: true,
              ...(baseUrl ? { baseUrl } : {}),
            },
          },
        };
      } else {
        next = {
          ...next,
          channels: {
            ...next.channels,
            mattermost: {
              ...next.channels?.mattermost,
              enabled: true,
              accounts: {
                ...next.channels?.mattermost?.accounts,
                [accountId]: {
                  ...next.channels?.mattermost?.accounts?.[accountId],
                  enabled: next.channels?.mattermost?.accounts?.[accountId]?.enabled ?? true,
                  ...(baseUrl ? { baseUrl } : {}),
                },
              },
            },
          },
        };
      }
    }

    return { cfg: next, accountId };
  },
  disable: (cfg: OpenClawConfig) => ({
    ...cfg,
    channels: {
      ...cfg.channels,
      mattermost: { ...cfg.channels?.mattermost, enabled: false },
    },
  }),
};
