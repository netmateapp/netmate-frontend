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

// https://www.hyuki.com/trans/leaf.html
const TEST_TEXTS: string[] = [
  "ワシントン・スクエア西にある小地区は、 道路が狂ったように入り組んでおり、 「プレース」と呼ばれる区域に小さく分かれておりました。 この「プレース」は不可思議な角度と曲線を描いており、 一、二回自分自身と交差している通りがあるほどでした。",
  "かつて、ある画家は、この通りが貴重な可能性を持っていることを発見しました。",
  "例えば絵や紙やキャンバスの請求書を手にした取り立て屋を考えてみてください。 取り立て屋は、この道を歩き回ったあげく、 ぐるりと元のところまで戻ってくるに違いありません。",
  "それで、芸術家たちはまもなく、奇妙で古いグリニッチ・ヴィレッジへとやってきました。 そして、北向きの窓と十八世紀の切り妻とオランダ風の屋根裏部屋と安い賃貸料を探してうろついたのです。 やがて、彼らは しろめ製のマグやこんろ付き卓上なべを一、二個、六番街から持ち込み、 「コロニー」を形成することになりました。",
  "スーはスケッチブックをセットすると、 雑誌小説の挿絵をペンとインクで描きはじめました。",
  "つたの葉は、まだそこにありました。",
  "それから一時間たって、ジョンジーはこう言いました。",
  "そして小さなオランダ風の窓ガラスごしに、 隣にある煉瓦造りの家の何もない壁を見つめつづけることになったのです。",
  "スーはメイン州の、ジョンジーはカリフォルニア州の出身でした。 二人は八番街の「デルモニコの店」の定食で出会い、 芸術と、チコリーのサラダと、ビショップ・スリーブの趣味がぴったりだとわかって、 共同のアトリエを持つことになったのでした。"
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
