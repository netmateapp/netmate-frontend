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
  "ななし",
  "サンプルテキスト",
  "江戸川乱歩",
  "二十面相",
  "長い文字列サンプル長い文字列サンプル"
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
  "タイトルサンプル",
  "秋の空はなぜ高いのか",
  "イラスト描いたよ"
];

function generateTestTitle(): Option<Title> {
  const title: Option<string> = pickUpValueOrUndefinedAtRandom(7, TEST_TITLES);
  return map(title, t => new Title(t));
}

const TEST_TEXTS: string[] = [
  "秋らしい空になってきた",
  "2段テキストサンプル\n2行目",
  "描いてみた\nどうかな？",
  "気温は夏なのに外は秋の匂いがする",
  "絵文字テキストサンプル🐉",
  "これらを仮定すれば、applyComposition は\n\n(fbc ＊ (fab ＊ fa)).map { (bc, (ab, a)) => bc(ab(a)) }\n = ((fbc ＊ fab) ＊ fa).map { ((bc, ab), a) => bc(ab(a)) }\n\nと等価",
  "これに対するアプローチはいくつか存在しますが、その中でもある程度根本的に問題に対処するために必要なのが「量子誤り訂正」です。量子誤り訂正の基本的なアプローチは、複数の量子ビットが分散して一つの量子ビットの情報を持つことで、ノイズで少し情報が破損しても残りから情報を復元できるようにする、というものです。",
  "長文テキストサンプル長文テキストサンプル長文テキストサンプル長文テキストサンプル長文テキストサンプル長文テキストサンプル長文テキストサンプル長文テキストサンプル長文テキストサンプル長文テキストサンプル長文テキストサンプル長文テキストサンプル長文テキストサンプル長文テキストサンプル長文テキストサンプル長文テキストサンプル長文テキストサンプル長文テキストサンプル長文テキストサンプル長文テキストサンプル長文テキストサンプル長文テキストサンプル長文テキストサンプル長文テキストサンプル",
  "すべてが一気に実現するわけではありませんが、近い将来、AI なしではできなかったことをはるかに多く達成するのに役立つ AI を活用できるようになります。最終的には、私たち一人ひとりが、さまざまな分野の仮想専門家で構成されたパーソナル AI チームを持ち、協力して想像できるほぼすべてのものを作成できるようになります。子どもたちには、あらゆる科目、あらゆる言語、必要なペースで個別の指導を提供できる仮想家庭教師が付きます。同様のアイデアにより、より優れた医療、想像できるあらゆる種類のソフトウェアを作成できる能力などが実現するでしょう。",
];

function generateTestLeadSentences(): Option<LeadSenetences> {
  const text: Option<string> = pickUpValueOrUndefinedAtRandom(5, TEST_TEXTS);
  return map(text, t => new LeadSenetences(t));
}

const NETMATE_IMAGE_IDS = [
  new NetmateImageId("/src/lib/assets/test/sampleimage1.jpg"),
  new NetmateImageId("/src/lib/assets/test/sampleimage2.jpg"),
  new NetmateImageId("/src/lib/assets/test/sampleimage3.jpg"),
  new NetmateImageId("/src/lib/assets/test/sampleimage4.jpg"),
  new NetmateImageId("/src/lib/assets/test/sampleimage5.jpg"),
  new NetmateImageId("/src/lib/assets/test/sampleimage6.jpg"),
  new NetmateImageId("/src/lib/assets/test/sampleimage7.jpg")
];

function generateTestMediaId(): Option<MediaId> {
  return pickUpValueOrUndefinedAtRandom(15, NETMATE_IMAGE_IDS);
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
  "タグサンプル",
  "イラスト",
  "写真",
  "プログラミング",
  "秋",
  "量子コンピューター",
  "アニメ",
  "長い文字列サンプル長い文字列サンプル長い文字列サンプル",
  "雑談"
];

function generateTestTagName(): TagName {
  return new TagName(TAG_NAMES[getRandomInt(TAG_NAMES.length)]);
}
