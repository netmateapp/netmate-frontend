import { map, type Option } from "$lib/option";
import { ConversationsCount, NetmateImageId, SoundCloudTrackId, Text, Timestamp, Title, YouTubeVideoId, type MediaId } from "$lib/scripts/domain/share";
import { LeadSenetences, ShareCard } from "$lib/scripts/domain/shareCard";
import { Tag, TagName } from "$lib/scripts/domain/tag";
import { UnixTimeMillis } from "$lib/scripts/primitive/unixtime";
import { genTestUuid4, genTestUuid7 } from "$lib/uuid";
import { Handle, HandleName } from "./handle";
import { SessionShareData, type SessionMediaId } from "./session";
import { Rating } from "./vote";

export function generateMockSessionShareData(): SessionShareData {
  const title = generateTestTitle();
  let text = generateTestText();
  const mediaId = generateTestSessionMediaId();
  if (title === undefined && text === undefined && mediaId === undefined) {
    text = new Text(TEST_TEXTS[getRandomInt(TEST_TEXTS.length)]);
  }

  return new SessionShareData(
    genTestUuid7(),
    generateTestHandle(),
    generateTestTimestamp(),
    generateTestRating(),
    title,
    text,
    mediaId,
    mediaId !== undefined && !(mediaId instanceof SoundCloudTrackId) && !(mediaId instanceof YouTubeVideoId) ? getRandomInt(5) === 0 : false,
    getRandomInt(5) === 0
  )
}

const HANDLE_NAMES: string[] = [
  "名義A",
  "名義B",
  "名義C",
  "名義D",
  "名義E",
];

function generateTestHandle(): Handle {
  return new Handle(genTestUuid4(), new HandleName(HANDLE_NAMES[getRandomInt(HANDLE_NAMES.length)]));
}

const RATINGS = [
  Rating.HighRating,
  Rating.Rating,
  Rating.LowRating,
  undefined
];

function generateTestRating(): Option<Rating> {
  return RATINGS[getRandomInt(RATINGS.length)];
}

function generateTestText(): Option<Text> {
  const text: Option<string> = pickUpValueOrUndefinedAtRandom(5, TEST_TEXTS);
  return map(text, t => new Text(t));
}

function generateTestSessionMediaId(): Option<SessionMediaId> {
  const has = getRandomInt(5) < 2;
  if (!has) return undefined;

  const count = getRandomInt(4) + 1;
  const array: NetmateImageId[] = [];
  for (let i = 0; i < count; i++) array.push(NETMATE_IMAGE_IDS[getRandomInt(NETMATE_IMAGE_IDS.length)]);

  return array;
}

export function generateMockShareCards(): ShareCard {
  const title = generateTestTitle();
  let leadSentences = generateTestLeadSentences();
  const mediaId = generateTestMediaId();
  if (title === undefined && leadSentences === undefined && mediaId === undefined) {
    leadSentences = new LeadSenetences(TEST_TEXTS[getRandomInt(TEST_TEXTS.length)]);
  }

  return new ShareCard(
    genTestUuid7(),
    generateTestTimestamp(),
    generateTestConversationsCount(),
    title,
    leadSentences,
    mediaId,
    mediaId instanceof NetmateImageId ? getRandomInt(5) === 0 : false
  )
}

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function pickUpValueOrUndefinedAtRandom<T>(undefinedCount: number, values: T[]): Option<T> {
  const rand = getRandomInt(values.length + undefinedCount);
  return rand < values.length ? values[rand] : undefined;
}

const TEST_TITLES: string[] = [
  "タイトル",
];

function generateTestTitle(): Option<Title> {
  const title: Option<string> = pickUpValueOrUndefinedAtRandom(7, TEST_TITLES);
  return map(title, t => new Title(t));
}

const TEST_TEXTS: string[] = [
  "第一毛をもって装飾されべきはずの顔がつるつるしてまるで薬缶だ。その後猫にもだいぶ逢ったがこんな片輪には一度も出会わした事がない。のみならず顔の真中があまりに突起している。そうしてその穴の中から時々ぷうぷうと煙を吹く。どうも咽せぽくて実に弱った。これが人間の飲む煙草というものである事はようやくこの頃知った。",
  "ふと気が付いて見ると書生はいない。たくさんおった兄弟が一疋も見えぬ。肝心の母親さえ姿を隠してしまった。その上今までの所とは違って無暗に明るい。眼を明いていられぬくらいだ。はてな何でも容子がおかしいと、のそのそ這い出して見ると非常に痛い。吾輩は藁の上から急に笹原の中へ棄てられたのである。",
  "この書生の掌の裏でしばらくはよい心持に坐っておったが、しばらくすると非常な速力で運転し始めた。書生が動くのか自分だけが動くのか分らないが無暗に眼が廻る。胸が悪くなる。到底助からないと思っていると、どさりと音がして眼から火が出た。それまでは記憶しているがあとは何の事やらいくら考え出そうとしても分らない。",
  "吾輩は猫である。名前はまだ無い。\nどこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。吾輩はここで始めて人間というものを見た。しかもあとで聞くとそれは書生という人間中で一番獰悪な種族であったそうだ。この書生というのは時々我々を捕て煮て食うという話である。しかしその当時は何という考もなかったから別段恐しいとも思わなかった。ただ彼の掌に載せられてスーと持ち上げられた時何だかフワフワした感じがあったばかりである。掌の上で少し落ちついて書生の顔を見たのがいわゆる人間というものの見始であろう。この時妙なものだと思った感じが今でも残っている。",
];

function generateTestLeadSentences(): Option<LeadSenetences> {
  const text: Option<string> = pickUpValueOrUndefinedAtRandom(5, TEST_TEXTS);
  return map(text, t => new LeadSenetences(t));
}

const NETMATE_IMAGE_IDS = [
  new NetmateImageId("/src/lib/assets/test/sample.png"),
];

function generateTestMediaId(): Option<MediaId> {
  return pickUpValueOrUndefinedAtRandom(3, NETMATE_IMAGE_IDS);
}

function generateTestConversationsCount(): ConversationsCount {
  return new ConversationsCount(getRandomInt(1000));
}

function generateTestTimestamp(): Timestamp {
  const unixtime = new UnixTimeMillis(1717989007669 - getRandomInt(259200000));
  return new Timestamp(unixtime);
}

export function generateTestTag(): Tag {
  return new Tag(genTestUuid4(), generateTestTagName());
}

const TAG_NAMES: string[] = [
  "子タグA",
  "子タグB",
  "子タグC",
  "子タグD",
  "子タグE",
  "子タグF",
  "子タグG",
  "子タグH",
];

function generateTestTagName(): TagName {
  return new TagName(TAG_NAMES[getRandomInt(TAG_NAMES.length)]);
}
