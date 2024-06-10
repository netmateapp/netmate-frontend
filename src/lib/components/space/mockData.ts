import type { Option } from "$lib/option";
import { genTestUuid4, genTestUuid7, Uuid4, type Uuid7 } from "$lib/uuid";
import { ImageUrl, type MediaKey } from "./share/Share.svelte";

export class TestShareData {
  constructor(
    public readonly id: Uuid7,
    public readonly title: Option<string>,
    public text: Option<string>,
    public readonly mediaKey: Option<MediaKey>,
    public readonly conversationsCount: number,
    public readonly timestamp: number,
  ) {}
}

export function genTestShareData(): TestShareData {
  const data =  new TestShareData(
    genTestUuid7(),
    genTestTitle(),
    genTestText(),
    genTestMediaKey(),
    genTestConversationsCount(),
    genTestTimestamp()
  );
  if (data.text === undefined) {
    data.text = texts[getRandomInt(texts.length)];
  }
  return data;
}

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function randomPickOrUndef<T>(ts: T[], undefs: number): Option<T> {
  const rand = getRandomInt(ts.length + undefs);
  return rand < ts.length ? ts[rand] : undefined;
}

function genTestTitle(): Option<string> {
  return randomPickOrUndef(
    [
      "アロナと積乱雲",
      "かわいいVtuber作って釣ろうずｗｗｗ",
      "学マスなるものが出たらしい",
    ],
    7
  );
}

const texts = [
  "欲求不満なときのエルフのお姫様の絵です",
  "デケェハンバーガー()を食う友希那さん\n一口デカそう",
  "姫崎ちゃんかわい〜〜〜〜！！！！\nちょっとセクシーすぎるよ〜！！",
  "チャイナムツキ膳…",
  "大鳳ﾁｬﾝ>🐉",
  "もしこのタイトルと予測が外れるとしたらそれはごくごく一部の者にだけ高級ラノベ本が買われているという意味になり一般人はもちろんの事普通のラノベファンすらも大多数が見放した時です。その時のラノベ一般書の価格帯は1500～2200という価格帯で売られていることだろう。それが「ウルトラＣ」の中身です。でもそれはそれで別の意味でラノベの死を意味する。そう、こうなるともう紙媒体のラノベ本を持っている人は世の中で「レア」な存在に落ちたことを意味するからだ。",
  "当時はニコニコ動画全盛期、しかもMinecraft動画が大ブーム。サバイバルの実況からいろんなジャンルへと分化が進み、建築メインの動画も増えてきた時期でした。\nところが、今よりずっと面倒だったMODの導入方法も建築のノウハウも手探り状態なうえ、当時の主要な動画検索手段だったニコニコ動画のタグも「Minecraft自宅紹介シリーズ」「マイクラ一級建築士シリーズ」くらいしかなく、建築動画をまとめて検索できるタグすらない状況でした。\n特に「マイクラ一級建築士シリーズ」なんてタグを自分でつけるのはとても恐れ多いですので、見てくれた視聴者の方にタグを追加してもらうのをじっと待つほかありませんでした。",
  "で、私は「真のラノベ市場の第一ピーク」って1997年だと思ってるんですよ。なぜかって？　膨大な若年層（厳密には23歳前後の新社会人層）が1996年末頃にラノベを卒業するかどうかの世代に当たるからです。そうです。年約200万人も出生数がいる団塊ジュニア世代の存在です。今の18歳人口年約110万人だぞ。それを考えたら真のラノベ市場は1997年頃がピークで読者のすそ野も大きく、逆に2013～2016年当時は既に一強多弱。つまりごくごく一部のタイトルだけミリオンだしてあとは全滅というのが真相なんだろうしじゃなかったら出版市場額全体が2兆6564億円（1996年）から1兆5400億円（2018年）にまで下がるはずがないからである。",
  "みんなのことだからちゃんとクリスマスは1人で過ごしたよね？彼氏や彼女なんて画面の中にしかいないよね？信じてるよ私？\nそんなわけで今日はオタクくんの奇行を紹介しちゃいたいと思いまーすｗｗｗｗｗｗｗｗｗｗｗｗ\n\n\nお前らオタク名乗ってるからには去年これやったよな？やったよな？やってない奴なんていないよな！？\nアアァァアアアアアン！！！！？？？？\n私はやってないけど",
  "クリスマスにこういう画像を上げるというのは一種の「祭り」の側面があったために広く行われていたわけだが、オタクのメインストリームがtwitterに移行してからは、「クリスマススレ」みたいなものが立てられなくなったことや、ガラケー・スマホ時代からインターネットに流入した人間の大半はオタクではなかったため、このような風習はだんだんと廃れていく。",
];
function genTestText(): Option<string> {
  return randomPickOrUndef(
    texts,
    1
  );
}

function genTestMediaKey(): Option<MediaKey> {
  return randomPickOrUndef(
    [
      new ImageUrl("/src/lib/assets/test/sampleimage1.jpg"),
      new ImageUrl("/src/lib/assets/test/sampleimage2.jpg"),
      new ImageUrl("/src/lib/assets/test/sampleimage3.jpg"),
      new ImageUrl("/src/lib/assets/test/sampleimage4.jpg"),
      new ImageUrl("/src/lib/assets/test/sampleimage5.jpg"),
      new ImageUrl("/src/lib/assets/test/sampleimage6.jpg"),
      new ImageUrl("/src/lib/assets/test/sampleimage7.jpg"),
    ],
    15
  );
}

function genTestConversationsCount(): number {
  return getRandomInt(1000);
}

function genTestTimestamp(): number {
  return 1717989007669 - getRandomInt(259200000);
}

export function genTestTagId(): Uuid4 {
  return genTestUuid4();
}

export function getTestTagName(): string {
  const tagNames = ["早瀬ユウカ", "早瀬ユウカイラスト", "陸八魔アル", "一之瀬アスナ", "天雨アコ", "夏の特殊作戦！RABBIT小隊と消えたエビの謎", "古関ウイ", "羽川ハスミ", "空崎ヒナ"];
  return tagNames[getRandomInt(tagNames.length)];
}