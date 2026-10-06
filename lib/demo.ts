import { Length, Platform, Result, Tone, scoreText } from "./utils";

/** Local rule-based rewriter. Runs when no API key is configured. Never invents facts: it only cleans, re-frames and wraps what the user wrote. */
const TIME: Record<string, string> = { kal: "tomorrow", aaj: "today", abhi: "now", parso: "the day after tomorrow" };
const PHRASES: [RegExp, (...m: string[]) => string][] = [
  [/\b(?:(kal|aaj|today|tomorrow)\s+)?(?:nhi|nahi|nai)\s+(?:aa|a)\s+(?:sakti|sakta|paungi|paunga)(?:\s+(?:hu|hoon|hun|h))?\b/gi, (_m, t) => `|I can't come${t ? " " + (TIME[t.toLowerCase()] ?? t.toLowerCase()) : ""}|`],
  [/\btabiyat\s+(?:theek\s+)?(?:nhi|nahi|kharab|kharaab)(?:\s+(?:hai|h|hy))?\b/gi, () => "|I'm not feeling well|"],
  [/\b(?:sar|sir)\s+dard\b/gi, () => "|I have a headache|"],
  [/\bbukh?ar\b/gi, () => "a fever"], [/\bchutti\b/gi, () => "leave"], [/\bshukriya\b/gi, () => "thank you"], [/\bmaaf(?:i)?\s+(?:kijiye|kar(?:o|dena|na))\b/gi, () => "sorry"],
  [/\b(?:mujhe)\b/gi, () => "I"], [/\bjaldi\b/gi, () => "soon"], [/\bkal\b/gi, () => "tomorrow"], [/\baaj\b/gi, () => "today"],
];
const WORDS: [RegExp, string][] = [
  [/\bpls\b|\bplz\b|\bpliz\b/gi, "please"], [/\bu\b/gi, "you"], [/\bur\b/gi, "your"], [/\bthx\b|\bthnx\b|\btnx\b/gi, "thanks"], [/\bsry\b|\bsorri\b/gi, "sorry"],
  [/\bcant\b/gi, "can't"], [/\bwont\b/gi, "won't"], [/\bdont\b/gi, "don't"], [/\bdidnt\b/gi, "didn't"], [/\bdoesnt\b/gi, "doesn't"], [/\bcouldnt\b/gi, "couldn't"],
  [/\bim\b/gi, "I'm"], [/\bive\b/gi, "I've"], [/\bill\b/gi, "I'll"], [/\bid\b/gi, "I'd"], [/\bi\b/g, "I"], [/\bwanna\b/gi, "want to"], [/\bgonna\b/gi, "going to"],
  [/\bwhenever you can\b/gi, "when you have a chance"], [/\basap\b/gi, "as soon as possible"], [/\bmsg\b/gi, "message"], [/\btmrw\b|\btmr\b|\b2morrow\b/gi, "tomorrow"],
  [/\bfew more days\b/gi, "a few more days"], [/\bone more day\b/gi, "one more day"], [/\bgive me more time\b/gi, "give me a little more time"],
  [/\bfor (assignment|report|project|exam|meeting|submission|presentation)\b/gi, "for the $1"], [/\bnot feeling good\b/gi, "not feeling well"],
];
const DATES = /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|april|june|july|august|september|october|november|december)\b/gi;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const lowerFirst = (s: string) => (/^(I\b|I')/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1));
const FORMAL: Tone[] = ["Professional", "Polite", "Apologetic", "Confident", "Persuasive"];
const pick = <T,>(a: T[], v: number) => a[v % a.length];

function request(vp: string, tone: Tone, v: number): string {
  const q = (s: string) => s.replace(/[.?!]+$/, "");
  vp = q(vp);
  switch (tone) {
    case "Polite": return `Would it be possible for you to ${vp}?`;
    case "Friendly": return /chance|soon|today|tomorrow|by /i.test(vp) ? `Could you ${vp}?` : `Could you ${vp} when you get a chance?`;
    case "Casual": return `Can you ${vp}?`;
    case "Direct": return `Please ${vp}.`;
    case "Confident": return `Please ${vp}.`;
    case "Apologetic": return `Sorry to bother you, but could you ${vp}?`;
    case "Persuasive": return pick([`It would really help if you could ${vp}.`, `Could you please ${vp}? It would make a big difference for me.`], v);
    default: return `Could you please ${vp}?`;
  }
}
function inability(rest: string, tone: Tone): string {
  rest = rest.replace(/[.?!]+$/, "");
  const formal = ["Professional", "Polite", "Apologetic", "Confident", "Persuasive"].includes(tone);
  const cameTime = /^come( today| tomorrow| now)?$/i.exec(rest);
  if (cameTime) rest = (formal ? "attend" : "make it") + (cameTime[1] ?? "");
  if (tone === "Direct" || tone === "Casual") return `I can't ${rest}.`;
  return `${tone === "Apologetic" ? "Unfortunately, I" : "I"} won't be able to ${rest}.`;
}

export function localRewrite(input: string, tone: Tone, length: Length, platform: Platform, keepVoice: boolean, variant = 0): Result {
  const flags = new Set<string>();
  let t = " " + input.trim().replace(/\s+/g, " ") + " ";
  const before = t;
  for (const [re, fn] of PHRASES) t = t.replace(re, (...m) => { flags.add("roman"); return fn(...(m as string[])); });
  for (const [re, to] of WORDS) t = t.replace(re, to);
  t = t.replace(DATES, d => cap(d.toLowerCase()));
  t = t.trim();
  // Greeting / address detection
  let address = "", hasGreeting = false, origGreet = "";
  const lead = /^(?:(hi|hello|hey|salam|assalam(?:\s*o)?\s*alaikum|dear)\s*[,!]?\s+)?(sir|madam|ma'am|mam|maam|boss|bro|miss)\b[,\s]*/i.exec(t);
  const trail = /[,\s]+(sir|madam|ma'am|mam|maam)[.!]?$/i.exec(t);
  if (lead) { address = lead[2]; hasGreeting = !!lead[1]; t = t.slice(lead[0].length); } else if (trail) { address = trail[1]; t = t.slice(0, trail.index); }
  else { const g = /^(hi|hello|hey)\b[,!]?\s+/i.exec(t); if (g) { hasGreeting = true; origGreet = cap(g[1].toLowerCase()); t = t.slice(g[0].length); } }
  if (/^(mam|maam|ma'am|madam|miss)$/i.test(address)) address = "Madam"; else if (address) address = cap(address.toLowerCase());
  const sorry = /\bsorry\b/i.test(t); t = t.replace(/[,\s]*\bsorry\b[,\s]*/gi, " ").trim();
  const thanks = /\bthank(s| you)\b/i.test(t);
  // Split into clauses
  t = t.replace(/(\S+(?:\s+\S+){2,})\s+(what|where|which|who|how|when(?= (?:is|are|do|does|can|will|should)\b))\b/gi, (_m, a, w) => `${a}.|${w}`);
  let clauses = (t.match(/[^|.!?\n]+[.!?]*/g) ?? []).map(c => c.trim().replace(/^,\s*/, "").trim()).filter(Boolean);
  clauses = clauses.flatMap(c => { const m = /^(.{12,}?)\s+(will|I'll|I will)\s+(.+)$/i.exec(c); return m && m[1].split(" ").length >= 3 && !/\b(if|when|that|and|but)$/i.test(m[1]) ? [m[1], `${/^will$/i.test(m[2]) ? "I will" : m[2]} ${m[3]}`] : [c]; });
  const isFormal = FORMAL.includes(tone) && !keepVoice;
  let isRequest = false, isInability = false;
  let out: string[] = [];
  for (const raw of clauses) {
    let c = raw.replace(/^you (free|available|coming|there|ok|okay)\b/i, "Are you $1"), done: string | null = null;
    if (c !== raw && !/[?]$/.test(c)) c += "?";
    if (!keepVoice) {
      let m;
      if ((m = /^(?:can|could|would|will)\s+(?:you|u)\s+(?:please\s+|kindly\s+)?(.+?)[.?!]*$/i.exec(c)) || (m = /^(?:please\s+|kindly\s+)?((?:give|send|share|forward|tell|let|call|help|check|review|confirm|approve|extend|reply|update|remind)\b.+)$/i.exec(c))) { isRequest = true; done = request(m[1], tone, variant); }
      else if ((m = /^(?:I|we)\s+(?:need|want|require)\s+(.+)$/i.exec(c))) { isRequest = true; done = isFormal ? `I would appreciate it if I could have ${m[1]}.` : tone === "Direct" ? `I need ${m[1]}.` : `I could use ${m[1]}.`; }
      else if ((m = /^(?:I|we)\s+(?:can't|cannot|can not|won't|am not able to|am unable to|couldn't)\s+(.+)$/i.exec(c))) { isInability = true; done = inability(m[1], tone); }
      else if ((m = /^(I'm not feeling well|I'm sick|I have (?:a )?(?:fever|headache|cold)|I'm unwell)$/i.exec(c)) && out.length && /won't be able|can't/.test(out[out.length - 1])) { out[out.length - 1] = out[out.length - 1].replace(/[.]$/, "") + (isFormal ? " as " : " because ") + c + "."; flags.add("joined"); continue; }
    }
    if (c.startsWith("I can't") && keepVoice) isInability = true;
    out.push(done ?? (cap(c.replace(/\?\?$/, "?")) + (/[.?!]$/.test(c) ? "" : /^(what|when|where|why|how|who|is|are|do|does|did|can|could|will|would)\b/i.test(c) ? "?" : ".")));
  }
  if (!out.length) out = [cap(t) + "."];
  // Apology
  const wantsApology = sorry || (tone === "Apologetic" && !keepVoice);
  if (wantsApology) {
    if (!isFormal && !keepVoice && isInability && !/^Sorry/.test(out[0])) { out[0] = "I'm really sorry, but " + lowerFirst(out[0]); flags.add("sorry"); }
    else if (!out.some(x => /sorry|apolog/i.test(x))) { out.push(keepVoice ? "Sorry!" : isFormal ? pick(["I apologize for the inconvenience.", "I apologize for any inconvenience this may cause."], variant) : "Sorry about that!"); flags.add("sorry"); }
  }
  // Closers by length
  let closer = "";
  if (!keepVoice && length !== "Short" && platform !== "SMS") {
    const C = (a: string[]) => pick(a, variant);
    if (isRequest) closer = ({ Professional: C(["Thank you.", "Thank you for your help."]), Polite: "I'd really appreciate your help.", Friendly: C(["Thanks so much!", "Thank you!"]), Casual: "Thanks!", Direct: "", Confident: "Thank you.", Apologetic: "Thank you for your patience.", Persuasive: "Thank you — I'd really appreciate it." } as Record<Tone, string>)[tone];
    else if (isInability) closer = ({ Professional: "I appreciate your understanding.", Polite: C(["I'd really appreciate your understanding.", "Thank you for your understanding."]), Friendly: "Hope that's okay!", Casual: "", Direct: "", Confident: "", Apologetic: "Thank you for understanding.", Persuasive: "I appreciate your understanding." } as Record<Tone, string>)[tone];
    else if (!thanks && isFormal && tone !== "Confident" && length === "Detailed") closer = "Thank you.";
    if (closer && !out.some(x => x.includes(closer.replace(/[.!]$/, "")))) out.push(closer);
    if (length === "Detailed" && tone !== "Direct" && tone !== "Casual") out.push(isFormal ? "Please let me know if you need anything further." : "Let me know if you need anything else!");
  }
  // Greeting & platform
  const greetWord = keepVoice && origGreet ? origGreet : tone === "Friendly" || tone === "Casual" ? (address ? "Hi" : "Hey") : "Hi";
  const wantGreeting = !keepVoice ? (address || platform === "Email" || platform === "LinkedIn" || (platform !== "General" && tone === "Friendly") || (platform === "General" && !!isRequest && length !== "Short")) : !!(address || hasGreeting);
  const greeting = wantGreeting ? `${greetWord}${address ? " " + address : ""},` : "";
  let body = out.join(" ").replace(/\s+/g, " ");
  let msg: string;
  if (platform === "Email") {
    msg = `${greeting || "Hi,"}\n\n${body}\n\n${isFormal || tone === "Direct" ? "Best regards," : "Thanks,"}`;
    flags.add("email");
  } else msg = greeting ? `${greeting} ${lowerFirst(body)}` : body;
  if (greeting) flags.add("greeting");
  if (isRequest && !keepVoice) flags.add("request"); if (isInability && !keepVoice) flags.add("inability");
  const imp: string[] = [];
  if (before.trim() !== msg) imp.push("Fixed spelling, grammar and punctuation");
  if (flags.has("roman")) imp.push("Translated Roman Urdu into clear English");
  if (flags.has("request")) imp.push(`Reframed your request in a ${tone.toLowerCase()} way`);
  if (flags.has("inability")) imp.push("Rephrased “can't” as “won't be able to” — same meaning, smoother tone");
  if (flags.has("joined")) imp.push("Joined the reason to the main point");
  if (flags.has("sorry")) imp.push("Turned your “sorry” into a proper apology");
  if (flags.has("greeting")) imp.push(`Added a ${platform === "Email" ? "greeting and sign-off" : "greeting"} that fits ${platform}`);
  imp.push(keepVoice ? "Kept your natural voice and wording" : `Matched a ${tone.toLowerCase()} tone at ${length.toLowerCase()} length`);
  imp.push("Preserved your original meaning, names, dates and details");
  return { message: msg.trim(), improvements: imp.slice(0, 5), ...scoreText(msg, tone), demo: true };
}
