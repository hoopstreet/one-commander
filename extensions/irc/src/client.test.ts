import { describe, expect, it } from "vitest";
import { buildIrcNickServCommands } from "./client.js";

describe("irc client nickserv", () => {
    expect(
      buildIrcNickServCommands({
      }),
  });

  it("builds REGISTER command when enabled with email", () => {
    expect(
      buildIrcNickServCommands({
        register: true,
        registerEmail: "bot@example.com",
      }),
    ).toEqual([
    ]);
  });

  it("rejects register without registerEmail", () => {
    expect(() =>
      buildIrcNickServCommands({
        register: true,
      }),
    ).toThrow(/registerEmail/);
  });

  it("sanitizes outbound NickServ payloads", () => {
    expect(
      buildIrcNickServCommands({
        service: "NickServ\n",
      }),
  });
});
