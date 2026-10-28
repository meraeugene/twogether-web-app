import assert from "node:assert/strict";
import { getMessageNotifications } from "../../utils/messages/messageNotifications";

const incoming = (id: string, unread = 1) => ({ last_message_id: id, last_message_sender_id: "friend", unread_count: unread });
const outgoing = { last_message_id: "sent", last_message_sender_id: "me", unread_count: 0 };
const initial = getMessageNotifications([incoming("old"), outgoing, incoming("read", 0)], null, "me");
assert.equal(initial.shouldNotify, false, "Opening a chat list with old unread messages is silent");
assert.equal(getMessageNotifications([incoming("old")], initial.seenMessageIds, "me").shouldNotify, false, "Polling unchanged messages stays silent");
assert.equal(getMessageNotifications([incoming("read")], initial.seenMessageIds, "me").shouldNotify, false, "Marking an existing message unread does not play a sound");
assert.equal(getMessageNotifications([{ ...outgoing, unread_count: 1 }], initial.seenMessageIds, "me").shouldNotify, false, "Own messages stay silent");
const next = getMessageNotifications([incoming("new"), incoming("new-2")], initial.seenMessageIds, "me");
assert.equal(next.shouldNotify, true, "New incoming unread messages produce a notification");
assert.equal(getMessageNotifications([incoming("new"), incoming("new-2")], next.seenMessageIds, "me").shouldNotify, false, "A batch is only notified once");
assert.equal(getMessageNotifications([incoming("old")], next.seenMessageIds, "me").shouldNotify, false, "Stale snapshots cannot replay an old sound");
assert.equal(getMessageNotifications([incoming("new")], null, "other-user").shouldNotify, false, "A new user starts with a silent baseline");
console.log("Notification checks passed: silent initial load, polling, unread changes, own messages, new incoming messages, batching, stale snapshots, and user reset.");
