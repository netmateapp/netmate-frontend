import type { Option } from "$lib/option";
import { genTestUuid4, genTestUuid7, Uuid4, type Uuid7 } from "$lib/uuid";
import { ImageUrl, type MediaKey } from "./share/Share.svelte";

export class TestShareData {
  constructor(
    public readonly id: Uuid7,
    public readonly title: Option<string>,
    public readonly text: Option<string>,
    public readonly mediaKey: Option<MediaKey>,
    public readonly conversationsCount: number,
    public readonly timestamp: number,
  ) {}
}

export function genTestShareData(): TestShareData {
  return new TestShareData(
    genTestUuid7(),
    genTestTitle(),
    genTestText(),
    genTestMediaKey(),
    genTestConversationsCount(),
    genTestTimestamp()
  );
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

function genTestText(): Option<string> {
  return randomPickOrUndef(
    [
      "みんなのことだからちゃんとクリスマスは1人で過ごしたよね？彼氏や彼女なんて画面の中にしかいないよね？信じてるよ私？\nそんなわけで今日はオタクくんの奇行を紹介しちゃいたいと思いまーすｗｗｗｗｗｗｗｗｗｗｗｗ\n\n\nお前らオタク名乗ってるからには去年これやったよな？やったよな？やってない奴なんていないよな！？\nアアァァアアアアアン！！！！？？？？\n私はやってないけど",
      "クリスマスにこういう画像を上げるというのは一種の「祭り」の側面があったために広く行われていたわけだが、オタクのメインストリームがtwitterに移行してからは、「クリスマススレ」みたいなものが立てられなくなったことや、ガラケー・スマホ時代からインターネットに流入した人間の大半はオタクではなかったため、このような風習はだんだんと廃れていく。",
    ],
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