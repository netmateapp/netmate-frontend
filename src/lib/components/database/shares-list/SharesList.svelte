<script lang="ts">
  import { Uuid7 } from "$lib/uuid";
  import type { Option } from "$lib/option";
  import Header, { type Sort } from "./Header.svelte";
  import Pager from "./Pager.svelte";
  import Share, { ImageUrl, SoundCloudId, YouTubeId, type MediaKey } from "../share/Share.svelte";

  let resultsCount = 312;
  let initialSort: Sort = "newest";

  class ShareData {
    constructor(
      public readonly id: Uuid7,
      public readonly title: Option<string>,
      public readonly text: Option<string>,
      public readonly mediaUrl: Option<MediaKey>,
      public readonly conversationsCount: number,
      public readonly timestamp: number
    ) {}
  }

  let viewSharesData: ShareData[] = $state([]);
  function leftRowSharesData(): ShareData[] {
    const sharesData: ShareData[] = [];
    for (var i = 0; i < viewSharesData.length; i += 2) sharesData.push(viewSharesData[i]);
    return sharesData;
  }

  function rightRowSharesData(): ShareData[] {
    const sharesData: ShareData[] = [];
    for (var i = 1; i < viewSharesData.length; i += 2) sharesData.push(viewSharesData[i]);
    return sharesData;
  }

  function genTestUuid7(): Uuid7 {
    let maybeUuid = Uuid7.from("018fd2cc-7e27-7dfa-8424-87f58f98bfcc");
    let testUuid: Uuid7;
    if (maybeUuid.isOk()) {
      testUuid = maybeUuid.value;
    }
    return testUuid!;
  }

  viewSharesData = [
    new ShareData(
      genTestUuid7(),
      "New制服",
      undefined,
      new ImageUrl("https://pbs.twimg.com/media/GMagU4IacAArzpJ?format=jpg&name=4096x4096"),
      168,
      1703998920000
    ),
    new ShareData(
      genTestUuid7(),
      "アロナと積乱雲",
      "描いたﾖ\nかわわ",
      //new YouTubeId("899x5rU9mX8"),
      //new SoundCloudId("663204728"),
      undefined,
      212,
      1717339374613 
    ),
    new ShareData(
      genTestUuid7(),
      undefined,
      "忙しいの少し落ち着いたので溜まってるアニメを消化したい\nとりあえずガルクラとヨルクラ見よう",
      undefined,
      21,
      1717332004613 
    ),
    new ShareData(
      genTestUuid7(),
      undefined,
      "かつて、全てが渾然一体となった「インターネット・サブカル」という夢があった\nかつてインターネット・サブカルにあった「空気」は、以下の様な特徴を持つと、僕は考えます。\n\n無階級性―作り手・受け手の区別が重視されない\n無価値性―何か報酬を得たり賞賛を得ることが目的ではない。むしろそういう有用な価値を投げ捨てることこそがイキである\n無意味性―表現によって何かメッセージを伝えることが目的ではない。むしろメッセージ性なんて何もない無意味な表現こそがよい\nこのような特徴を持つサブカルチャー表現を、みんなで共有して盛り上がり、「祭り」を行うことを楽しむ、それこそがインターネット・サブカルの楽しみ方だったのです。",
      undefined,
      72,
      1703948400000 
    ),
    new ShareData(
      genTestUuid7(),
      "New制服",
      undefined,
      new ImageUrl("https://pbs.twimg.com/media/GMagU4IacAArzpJ?format=jpg&name=4096x4096"),
      168,
      1703998920000
    ),
    new ShareData(
      genTestUuid7(),
      "アロナと積乱雲",
      "描いたﾖ\nかわわ",
      new ImageUrl("https://pbs.twimg.com/media/GPEnJTJbQAEa78q?format=jpg&name=4096x4096"),
      212,
      1717339374613 
    ),
    new ShareData(
      genTestUuid7(),
      undefined,
      "忙しいの少し落ち着いたので溜まってるアニメを消化したい\nとりあえずガルクラとヨルクラ見よう",
      undefined,
      21,
      1717332004613 
    ),
    new ShareData(
      genTestUuid7(),
      undefined,
      "かつて、全てが渾然一体となった「インターネット・サブカル」という夢があった\nかつてインターネット・サブカルにあった「空気」は、以下の様な特徴を持つと、僕は考えます。\n\n無階級性―作り手・受け手の区別が重視されない\n無価値性―何か報酬を得たり賞賛を得ることが目的ではない。むしろそういう有用な価値を投げ捨てることこそがイキである\n無意味性―表現によって何かメッセージを伝えることが目的ではない。むしろメッセージ性なんて何もない無意味な表現こそがよい\nこのような特徴を持つサブカルチャー表現を、みんなで共有して盛り上がり、「祭り」を行うことを楽しむ、それこそがインターネット・サブカルの楽しみ方だったのです。",
      undefined,
      72,
      1703948400000 
    ),
    new ShareData(
      genTestUuid7(),
      "New制服",
      undefined,
      new ImageUrl("https://pbs.twimg.com/media/GMagU4IacAArzpJ?format=jpg&name=4096x4096"),
      168,
      1703998920000
    ),
    new ShareData(
      genTestUuid7(),
      "アロナと積乱雲",
      "描いたﾖ\nかわわ",
      new ImageUrl("https://pbs.twimg.com/media/GPEnJTJbQAEa78q?format=jpg&name=4096x4096"),
      212,
      1717339374613 
    ),
    new ShareData(
      genTestUuid7(),
      undefined,
      "忙しいの少し落ち着いたので溜まってるアニメを消化したい\nとりあえずガルクラとヨルクラ見よう",
      undefined,
      21,
      1717332004613 
    ),
    new ShareData(
      genTestUuid7(),
      undefined,
      "かつて、全てが渾然一体となった「インターネット・サブカル」という夢があった\nかつてインターネット・サブカルにあった「空気」は、以下の様な特徴を持つと、僕は考えます。\n\n無階級性―作り手・受け手の区別が重視されない\n無価値性―何か報酬を得たり賞賛を得ることが目的ではない。むしろそういう有用な価値を投げ捨てることこそがイキである\n無意味性―表現によって何かメッセージを伝えることが目的ではない。むしろメッセージ性なんて何もない無意味な表現こそがよい\nこのような特徴を持つサブカルチャー表現を、みんなで共有して盛り上がり、「祭り」を行うことを楽しむ、それこそがインターネット・サブカルの楽しみ方だったのです。",
      undefined,
      72,
      1703948400000 
    ),
    new ShareData(
      genTestUuid7(),
      "New制服",
      undefined,
      new ImageUrl("https://pbs.twimg.com/media/GMagU4IacAArzpJ?format=jpg&name=4096x4096"),
      168,
      1703998920000
    ),
  ]; 
</script>

<div class="shares-list-wrapper">
<div class="shares-list">
  <Header {resultsCount} {initialSort} />
  <div class="shares">
    <div class="left-row">
      {#each leftRowSharesData() as share}
        <Share
          id={share.id}
          title={share.title}
          text={share.text}
          mediaKey={share.mediaUrl}
          conversationsCount={share.conversationsCount}
          timestamp={share.timestamp} />
      {/each}
    </div>
    <div class="right-row">
      {#each rightRowSharesData() as share}
        <Share
          id={share.id}
          title={share.title}
          text={share.text}
          mediaKey={share.mediaUrl}
          conversationsCount={share.conversationsCount}
          timestamp={share.timestamp} />
      {/each}
    </div>
  </div>
  <Pager {resultsCount} />
  <div class="spacer"></div>
</div>
</div>

<style>
  .shares-list-wrapper {
    position: fixed;
    width: 100%;
    height: 100%;
    padding-top: 3.9375rem;
    padding-left: 16rem;
    overflow-y: scroll;
  }

  .shares-list {
    width: 59.5rem;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .shares {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  .left-row,
  .right-row {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 1rem;
  }

  .spacer {
    width: 1px;
    height: 0.125rem;
  }
</style>
