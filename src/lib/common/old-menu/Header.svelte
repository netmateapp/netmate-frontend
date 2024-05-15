<script lang="ts">
  import { createTranslator } from "../../../i18n.svelte";
  import Tooltip from "../tooltip/Tooltip.svelte";
  import { tooltip } from "../tooltip/useTooltip.svelte";

  const _ = createTranslator("common", "menu");

  // 言語メニュー関連
  let isLanguageButtonToggled = $state(false);
  let languageButtonRef: Element | null = $state(null);
  function toggleLanguageButton(event: MouseEvent | KeyboardEvent) {
    if (isLanguageButtonToggled && !languageMenuRef?.contains(event.target as Element)) {
      isLanguageButtonToggled = false;
    } else if (languageButtonRef?.contains(event.target as Element)) {
      isLanguageButtonToggled = true;
    }
  }

  const LANGUAGES: string[] = ["japanese", "korean", "traditional-chinese", "us-english"];
  let languageMenuRef: Element | null = $state(null);
  function setLanguage(language: string) {
    console.log("change my language: " + language);
  }

  // 場所メニュー関連
  let isLocationButtonToggled = $state(false);
  let locationButtonRef: Element | null = $state(null);
  function toggleLocationButton(event: MouseEvent | KeyboardEvent) {
    if (isLocationButtonToggled && !locationMenuRef?.contains(event.target as Element)) {
      isLocationButtonToggled = false;
    } else if (locationButtonRef?.contains(event.target as Element)) {
      isLocationButtonToggled = true;
    }
  }

  const LOCATIONS: string[] = ["japan", "korea", "taiwan", "united-states"];
  let locationMenuRef: Element | null = $state(null);
  function setLocation(location: string) {
    console.log("change my location: " + location);
  }

  // 名義メニュー関連
  let isHandlesButtonToggled = $state(false);
  let handlesButtonRef: Element | null = $state(null);
  function toggleHandlesButton(event: MouseEvent | KeyboardEvent) {
    if (isHandlesButtonToggled && !handlesMenuRef?.contains(event.target as Element)) {
      isHandlesButtonToggled = false;
    } else if (handlesButtonRef?.contains(event.target as Element)) {
      isHandlesButtonToggled = true;
    }
  }

  class Handle {
    id: number;
    name: string;
    sharesCount: number;

    constructor(id: number, name: string, sharesCount: number) {
      this.id = id;
      this.name = name;
      this.sharesCount = sharesCount;
    }
  }

  function handles(): Handle[] {
    return [new Handle(0, "匿名", 341), new Handle(12434, "はらむらのどか", 543), new Handle(7373748, "のどっち", 2849)];
  }

  let handlesMenuRef: Element | null = $state(null);

  let isHandleOperationsButtonToggled: boolean = $state(false);
  let operationTargetHandle: Handle | null = $state(null);
  let handleOperationsMenuRef: Element | null = $state(null);
  function handleHandleOperationsButton(event: MouseEvent | KeyboardEvent, handle: Handle) {
    event.stopPropagation();
    event.preventDefault();

    isHandleOperationsButtonToggled = true;
    operationTargetHandle = handle;
  }

  function handleHandleOperationMenu(event: MouseEvent | KeyboardEvent) {
    let element = event.target as Element;
    if (isHandleOperationsButtonToggled && !handleOperationsMenuRef?.contains(element)) {
      event.stopPropagation();
      isHandleOperationsButtonToggled = false;
      operationTargetHandle = null;
    }
  }

  // お知らせメニュー関連
  let isAnnouncementsButtonToggled = $state(false);
  let announcementsButtonRef: Element | null = $state(null);
  function toggleAnnouncementsButton(event: MouseEvent | KeyboardEvent) {
    if (isAnnouncementsButtonToggled && !announcementsMenuRef?.contains(event.target as Element)) {
      isAnnouncementsButtonToggled = false;
    } else if (announcementsButtonRef?.contains(event.target as Element)) {
      isAnnouncementsButtonToggled = true;
    }
  }

  class Announcement {
    id: number;
    title: string;
    read: boolean;
    
    constructor(id: number, title: string, read: boolean) {
      this.id = id;
      this.title = title;
      this.read = read;
    }
  }

  function announcements(): Announcement[] {
    return [
      new Announcement(3423425, "5/24 04:00 よりメンテナンスを行います", false),
      new Announcement(3423424, "5/24 04:00 よりメンテナンスを行います", true),
      new Announcement(3423423, "5/24 04:00 よりメンテナンスを行います", true),
    ]
  }

  function hasUnreadAnnouncements(): boolean {
    for (var announcement of announcements()) {
      if (!announcement.read) return true;
    }
    return false;
  }

  let announcementsMenuRef: Element | null = $state(null);

  // メインメニュー関連
  let isSeeMoreButtonToggled = $state(false);
  let seeMoreButtonRef: Element |null = $state(null);
  function toggleSeeMoreButton(event: MouseEvent | KeyboardEvent) {
    let element = event.target as Element;
    if (isSeeMoreButtonToggled && !mainMenuRef?.contains(element) && !mainMenuLanguageMenuRef?.contains(element)) {
      isSeeMoreButtonToggled = false;
    } else if (seeMoreButtonRef?.contains(element)) {
      isSeeMoreButtonToggled = true;
    }
  }

  // メインメニューから開いたメニュー
  let mainMenuRef: Element | null = $state(null);

  let languageItemRef: Element | null = $state(null);
  let mainMenuLanguageMenuRef: Element | null = $state(null);
  let isLanguageItemToggled = $state(false);
  function toggleLanguageItem(event: MouseEvent | KeyboardEvent) {
    if (isLanguageItemToggled && !mainMenuLanguageMenuRef?.contains(event.target as Element)) {
      isLanguageItemToggled = false;
    } else if (languageItemRef?.contains(event.target as Element)) {
      isLanguageItemToggled = true;
    }
  }

  let locationItemRef: Element | null = $state(null);
  let mainMenuLocationMenuRef: Element | null = $state(null);
  let isLocationItemToggled = $state(false);
  function toggleLocationItem(event: MouseEvent | KeyboardEvent) {
    if (isLocationItemToggled && !mainMenuLocationMenuRef?.contains(event.target as Element)) {
      isLocationItemToggled = false;
    } else if (locationItemRef?.contains(event.target as Element)) {
      isLocationItemToggled = true;
    }
  }

  // 全てのメニューの位置計算
  function calculateMenuPosition(buttonRef: Element | null, menuRef: Element | null) {
    if (buttonRef == null || menuRef == null) return `top: 0px; left 0px;`;

    const buttonRect = buttonRef.getBoundingClientRect();
    const menuRect = menuRef.getBoundingClientRect();

    let top = buttonRect.top + buttonRect.height + 2;
    let left = buttonRect.left;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left + menuRect.width > viewportWidth) {
      left = viewportWidth - menuRect.width - 16; // 端から16px空ける
    }

    if (top + menuRect.height > viewportHeight) {
      top = buttonRect.top - menuRect.height - 16;
    }

    return `top: ${top}px; left: ${left}px;`;
  }

  // 各要素にon:xxxでハンドラを結び付けた場合、要素の領域外のクリックは拾わない
  // ボタン外がクリックされた際にトグルが解除される必要があるため、要素にハンドラを結び付けない
  $effect(() => {
    [
      toggleLanguageButton,
      toggleLocationButton,
      toggleHandlesButton,
      handleHandleOperationMenu,
      toggleAnnouncementsButton,
      toggleSeeMoreButton,
      toggleLanguageItem,
      toggleLocationItem,
    ].forEach(handler => {
      document.addEventListener("click", handler);
      document.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key === "Enter") {
          handler(event);
        }
      });
    })
  })

  // mocks
  function isLoggedIn(): boolean {
    return false;
  }

  function userLanguageCode(): string {
    return "JA";
  }

  function userLocationCode(): string {
    return "JP";
  }
</script>

<div class="header">
  {#if isLoggedIn()}
    <button
      bind:this={languageButtonRef}
      class="stateful-button"
      class:button-toggled={isLanguageButtonToggled}
      use:tooltip={_("language-button-tooltip")}>
      <svg class="stateful-button-icon">
        <path d="M11.9002 21.0003L16.2579 10.0003H17.2809L21.6386 21.0003H20.5579L19.3675 17.9503H14.1713L12.9809 21.0003H11.9002ZM4.01939 18.1157L3.31169 17.408L8.20787 12.4926C7.63735 11.9093 7.06972 11.1913 6.50497 10.3388C5.94023 9.48622 5.52197 8.70672 5.25017 8.00031H6.33094C6.57452 8.56056 6.94312 9.20415 7.43672 9.93108C7.9303 10.658 8.42324 11.2759 8.91554 11.7849C9.78606 10.9016 10.5588 9.93204 11.2338 8.87626C11.9088 7.82049 12.3579 6.86184 12.5809 6.00031H2.38477V5.00031H8.50017V3.76953H9.50017V5.00031H15.6156V6.00031H13.6194C13.3207 7.04646 12.8117 8.1612 12.0925 9.34453C11.3732 10.5279 10.5502 11.5811 9.62324 12.5042L12.1579 15.108L11.7732 16.1388L8.91554 13.2061L4.01939 18.1157ZM14.5079 17.0465H19.0309L16.7694 11.2349L14.5079 17.0465Z"/>
      </svg>
      <span class="current-state">{userLanguageCode()}</span>
    </button>

    {#if isLanguageButtonToggled}
      <div bind:this={languageMenuRef} class="language-menu" style={calculateMenuPosition(languageButtonRef, languageMenuRef)}>
        {#each LANGUAGES as language}
          <button class="language-menu-item" onclick={() => setLanguage(language)}>
            <span class="language-menu-label">{_(language)}</span>
          </button>
        {/each}
      </div>
    {/if}

    <div
      bind:this={locationButtonRef}
      class="stateful-button"
      class:button-toggled={isLocationButtonToggled}
      use:tooltip={_("location-button-tooltip")}>
      <svg class="stateful-button-icon">
        <path d="M12.0034 21C10.7588 21 9.58872 20.7638 8.4931 20.2915C7.39748 19.8192 6.44444 19.1782 5.63397 18.3685C4.82352 17.5588 4.18192 16.6066 3.70915 15.512C3.23638 14.4174 3 13.2479 3 12.0034C3 10.7588 3.23616 9.58872 3.70848 8.4931C4.18081 7.39748 4.82183 6.44444 5.63153 5.63398C6.44123 4.82353 7.39337 4.18192 8.48795 3.70915C9.58255 3.23638 10.7521 3 11.9966 3C13.2412 3 14.4113 3.23616 15.5069 3.70847C16.6025 4.18081 17.5556 4.82182 18.366 5.63152C19.1765 6.44122 19.8181 7.39337 20.2908 8.48795C20.7636 9.58255 21 10.7521 21 11.9966C21 13.2412 20.7638 14.4113 20.2915 15.5069C19.8192 16.6025 19.1782 17.5556 18.3685 18.366C17.5588 19.1765 16.6066 19.8181 15.512 20.2909C14.4174 20.7636 13.2479 21 12.0034 21ZM11 19.95V18C10.45 18 9.97917 17.8042 9.5875 17.4125C9.19583 17.0208 9 16.55 9 16V15L4.2 10.2C4.15 10.5 4.10417 10.8 4.0625 11.1C4.02083 11.4 4 11.7 4 12C4 14.0167 4.6625 15.7833 5.9875 17.3C7.3125 18.8167 8.98333 19.7 11 19.95ZM17.9 17.4C18.2333 17.0333 18.5333 16.6375 18.8 16.2125C19.0667 15.7875 19.2875 15.3458 19.4625 14.8875C19.6375 14.4292 19.7708 13.9583 19.8625 13.475C19.9542 12.9917 20 12.5 20 12C20 10.357 19.549 8.85651 18.6471 7.49852C17.7452 6.14054 16.5295 5.16155 15 4.56155V5C15 5.55 14.8042 6.02083 14.4125 6.4125C14.0208 6.80417 13.55 7 13 7H11V9C11 9.28333 10.9042 9.52083 10.7125 9.7125C10.5208 9.90417 10.2833 10 10 10H8V12H14C14.2833 12 14.5208 12.0958 14.7125 12.2875C14.9042 12.4792 15 12.7167 15 13V16H16C16.4333 16 16.825 16.1292 17.175 16.3875C17.525 16.6458 17.7667 16.9833 17.9 17.4Z"/>
      </svg>
      <span class="current-state">{userLocationCode()}</span>
    </div>

    {#if isLocationButtonToggled}
      <div bind:this={locationMenuRef} class="location-menu" style={calculateMenuPosition(locationButtonRef, locationMenuRef)}>
        {#each LOCATIONS as location}
          <button class="location-menu-item" onclick={() => setLocation(location)}>
            <span class="location-menu-label">{_(location)}</span>
          </button>
        {/each}
      </div>
    {/if}
  {:else}
    <svg
      bind:this={handlesButtonRef}
      role="button"
      tabindex="0"
      class="button"
      class:button-toggled={isHandlesButtonToggled}
      use:tooltip={_("handles-button-tooltip")}>
      {#if isHandlesButtonToggled}
        <path d="M20 19.3848C19.175 19.3848 18.4688 19.091 17.8812 18.5035C17.2938 17.916 17 17.2098 17 16.3848C17 15.5598 17.2938 14.8535 17.8812 14.266C18.4688 13.6785 19.175 13.3848 20 13.3848C20.825 13.3848 21.5312 13.6785 22.1188 14.266C22.7063 14.8535 23 15.5598 23 16.3848C23 17.2098 22.7063 17.916 22.1188 18.5035C21.5312 19.091 20.825 19.3848 20 19.3848ZM13 26.6158V24.9695C13 24.5567 13.1202 24.1704 13.3605 23.8108C13.601 23.4513 13.9244 23.1721 14.3307 22.9733C15.2744 22.5208 16.2187 22.1813 17.1635 21.955C18.1083 21.7288 19.0538 21.6158 20 21.6158C20.9462 21.6158 21.8917 21.7288 22.8365 21.955C23.7813 22.1813 24.7256 22.5208 25.6693 22.9733C26.0756 23.1721 26.399 23.4513 26.6395 23.8108C26.8798 24.1704 27 24.5567 27 24.9695V26.6158H13Z"/>
      {:else}
        <path d="M20 19.3848C19.175 19.3848 18.4688 19.091 17.8812 18.5035C17.2938 17.916 17 17.2098 17 16.3848C17 15.5598 17.2938 14.8535 17.8812 14.266C18.4688 13.6785 19.175 13.3848 20 13.3848C20.825 13.3848 21.5312 13.6785 22.1188 14.266C22.7063 14.8535 23 15.5598 23 16.3848C23 17.2098 22.7063 17.916 22.1188 18.5035C21.5312 19.091 20.825 19.3848 20 19.3848ZM13 26.6156V24.9694C13 24.5566 13.1202 24.1704 13.3606 23.8107C13.601 23.4511 13.9244 23.172 14.3308 22.9732C15.2744 22.5207 16.2186 22.1812 17.1634 21.955C18.1083 21.7287 19.0539 21.6155 20 21.6155C20.9462 21.6155 21.8917 21.7287 22.8365 21.955C23.7814 22.1812 24.7256 22.5207 25.6692 22.9732C26.0756 23.172 26.399 23.4511 26.6394 23.8107C26.8798 24.1704 27 24.5566 27 24.9694V26.6156H13ZM14 25.6155H26V24.9694C26 24.7476 25.9285 24.5393 25.7856 24.3444C25.6426 24.1495 25.4449 23.9848 25.1923 23.8502C24.3692 23.4514 23.5206 23.146 22.6464 22.9338C21.7722 22.7216 20.8901 22.6155 20 22.6155C19.1099 22.6155 18.2278 22.7216 17.3536 22.9338C16.4794 23.146 15.6308 23.4514 14.8077 23.8502C14.5551 23.9848 14.3574 24.1495 14.2144 24.3444C14.0715 24.5393 14 24.7476 14 24.9694V25.6155ZM20 18.3848C20.55 18.3848 21.0208 18.189 21.4125 17.7973C21.8042 17.4056 22 16.9348 22 16.3848C22 15.8348 21.8042 15.364 21.4125 14.9723C21.0208 14.5806 20.55 14.3848 20 14.3848C19.45 14.3848 18.9792 14.5806 18.5875 14.9723C18.1958 15.364 18 15.8348 18 16.3848C18 16.9348 18.1958 17.4056 18.5875 17.7973C18.9792 18.189 19.45 18.3848 20 18.3848Z"/>
      {/if}
    </svg>

    <svg
      bind:this={announcementsButtonRef}
      role="button"
      tabindex="0"
      class="button"
      class:has-unread-announcement={hasUnreadAnnouncements()}
      class:button-toggled={isAnnouncementsButtonToggled}
      use:tooltip={_("announcements-button-tooltip")}>
      {#if isAnnouncementsButtonToggled}
        <path d="M19.5 24.5H20.5V19H19.5V24.5ZM20 17.577C20.1743 17.577 20.3205 17.518 20.4385 17.4C20.5565 17.282 20.6155 17.1358 20.6155 16.9615C20.6155 16.7872 20.5565 16.641 20.4385 16.523C20.3205 16.4052 20.1743 16.3462 20 16.3462C19.8257 16.3462 19.6795 16.4052 19.5615 16.523C19.4435 16.641 19.3845 16.7872 19.3845 16.9615C19.3845 17.1358 19.4435 17.282 19.5615 17.4C19.6795 17.518 19.8257 17.577 20 17.577ZM20.0033 29C18.7588 29 17.5887 28.7638 16.493 28.2915C15.3975 27.8192 14.4445 27.1782 13.634 26.3685C12.8235 25.5588 12.1819 24.6067 11.7092 23.512C11.2364 22.4175 11 21.2479 11 20.0033C11 18.7588 11.2362 17.5887 11.7085 16.493C12.1808 15.3975 12.8218 14.4445 13.6315 13.634C14.4412 12.8235 15.3933 12.1819 16.488 11.7092C17.5825 11.2364 18.7521 11 19.9967 11C21.2413 11 22.4113 11.2362 23.507 11.7085C24.6025 12.1808 25.5555 12.8218 26.366 13.6315C27.1765 14.4412 27.8181 15.3933 28.2908 16.488C28.7636 17.5825 29 18.7521 29 19.9967C29 21.2413 28.7638 22.4113 28.2915 23.507C27.8192 24.6025 27.1782 25.5555 26.3685 26.366C25.5588 27.1765 24.6067 27.8181 23.512 28.2908C22.4175 28.7636 21.2479 29 20.0033 29Z"/>
      {:else}
        <path d="M19.5 24.5H20.5V19H19.5V24.5ZM20 17.5769C20.1744 17.5769 20.3205 17.518 20.4385 17.4C20.5564 17.2821 20.6154 17.1359 20.6154 16.9615C20.6154 16.7872 20.5564 16.641 20.4385 16.5231C20.3205 16.4051 20.1744 16.3462 20 16.3462C19.8256 16.3462 19.6795 16.4051 19.5615 16.5231C19.4436 16.641 19.3846 16.7872 19.3846 16.9615C19.3846 17.1359 19.4436 17.2821 19.5615 17.4C19.6795 17.518 19.8256 17.5769 20 17.5769ZM20.0034 29C18.7588 29 17.5887 28.7638 16.4931 28.2915C15.3975 27.8192 14.4444 27.1782 13.634 26.3685C12.8235 25.5588 12.1819 24.6066 11.7091 23.512C11.2364 22.4174 11 21.2479 11 20.0034C11 18.7588 11.2362 17.5887 11.7085 16.4931C12.1808 15.3975 12.8218 14.4444 13.6315 13.634C14.4412 12.8235 15.3934 12.1819 16.488 11.7092C17.5826 11.2364 18.7521 11 19.9966 11C21.2412 11 22.4113 11.2362 23.5069 11.7085C24.6025 12.1808 25.5556 12.8218 26.366 13.6315C27.1765 14.4412 27.8181 15.3934 28.2908 16.488C28.7636 17.5826 29 18.7521 29 19.9966C29 21.2412 28.7638 22.4113 28.2915 23.5069C27.8192 24.6025 27.1782 25.5556 26.3685 26.366C25.5588 27.1765 24.6066 27.8181 23.512 28.2909C22.4174 28.7636 21.2479 29 20.0034 29ZM20 28C22.2333 28 24.125 27.225 25.675 25.675C27.225 24.125 28 22.2333 28 20C28 17.7667 27.225 15.875 25.675 14.325C24.125 12.775 22.2333 12 20 12C17.7667 12 15.875 12.775 14.325 14.325C12.775 15.875 12 17.7667 12 20C12 22.2333 12.775 24.125 14.325 25.675C15.875 27.225 17.7667 28 20 28Z"/>
      {/if}
    </svg>
  {/if}

  {#if isHandlesButtonToggled}
    <div bind:this={handlesMenuRef} class="handles-menu" style={calculateMenuPosition(handlesButtonRef, handlesMenuRef)}>
      {#each handles() as handle, i}
        <a href="https://netmate.app/handles/{handle.id}" class="handles-menu-item">
          <div class="handle-information">
            <span class="handle">{i ? handle.name : _("anonymous")}</span>
            <span class="shares-count">{_("shares-count", {count: handle.sharesCount})}</span>
          </div>
          <svg class="handle-operations-button">
            <path d="M11.4619 18C11.1869 18 10.9515 17.9021 10.7557 17.7063C10.5598 17.5104 10.4619 17.275 10.4619 17C10.4619 16.725 10.5598 16.4896 10.7557 16.2938C10.9515 16.0979 11.1869 16 11.4619 16C11.7369 16 11.9724 16.0979 12.1682 16.2938C12.364 16.4896 12.4619 16.725 12.4619 17C12.4619 17.275 12.364 17.5104 12.1682 17.7063C11.9724 17.9021 11.7369 18 11.4619 18ZM17.0004 18C16.7254 18 16.49 17.9021 16.2941 17.7063C16.0983 17.5104 16.0004 17.275 16.0004 17C16.0004 16.725 16.0983 16.4896 16.2941 16.2938C16.49 16.0979 16.7254 16 17.0004 16C17.2754 16 17.5108 16.0979 17.7066 16.2938C17.9025 16.4896 18.0004 16.725 18.0004 17C18.0004 17.275 17.9025 17.5104 17.7066 17.7063C17.5108 17.9021 17.2754 18 17.0004 18ZM22.5389 18C22.2638 18 22.0284 17.9021 21.8326 17.7063C21.6368 17.5104 21.5388 17.275 21.5388 17C21.5388 16.725 21.6368 16.4896 21.8326 16.2938C22.0284 16.0979 22.2638 16 22.5389 16C22.8139 16 23.0493 16.0979 23.2451 16.2938C23.4409 16.4896 23.5389 16.725 23.5389 17C23.5389 17.275 23.4409 17.5104 23.2451 17.7063C23.0493 17.9021 22.8139 18 22.5389 18Z"/>
          </svg>
        </a>
      {/each}
      <div class="new-handle-creator">
        <svg class="handle-menu-icon">
          <path d="M11.5 12.5H6V11.5H11.5V6H12.5V11.5H18V12.5H12.5V18H11.5V12.5Z"/>
        </svg>
        <input class="new-handle-input" placeholder={_("new-handle-input-placeholder")}>
      </div>
    </div>
    {#if isHandleOperationsButtonToggled}
      <div bind:this={handleOperationsMenuRef} class="handle-operations-menu">
        <div class="handle-operations-menu-item">
          <span class="handle-operations-menu-label">{_("edit-handle")}</span>
        </div>
        <div class="handle-operations-menu-item">
          <span class="handle-operations-menu-label">{_("delete-handle")}</span>
        </div>
      </div>
    {/if}
  {/if}

  {#if isAnnouncementsButtonToggled}
    <div bind:this={announcementsMenuRef} class="announcements-menu" style={calculateMenuPosition(announcementsButtonRef, announcementsMenuRef)}>
      {#each announcements() as announcement}
        <a href="https://netmate.app/announcements/{announcement.id}" class="announcements-menu-item">
          <span class="announcements-menu-timestamp">{announcement.id}</span>
          <span class="announcements-menu-title" class:unread-announcement={!announcement.read}>{announcement.title}</span>
        </a>
      {/each}
    </div>
  {/if}
    
  <svg
    bind:this={seeMoreButtonRef}
    role="button"
    tabindex="0"
    class="button"
    class:button-toggled={isSeeMoreButtonToggled}
    use:tooltip={_("see-more-button-tooltip")}>
    <path d="M14.4619 21C14.1869 21 13.9515 20.9021 13.7557 20.7063C13.5598 20.5104 13.4619 20.275 13.4619 20C13.4619 19.725 13.5598 19.4896 13.7557 19.2938C13.9515 19.0979 14.1869 19 14.4619 19C14.7369 19 14.9724 19.0979 15.1682 19.2938C15.364 19.4896 15.4619 19.725 15.4619 20C15.4619 20.275 15.364 20.5104 15.1682 20.7063C14.9724 20.9021 14.7369 21 14.4619 21ZM20.0004 21C19.7254 21 19.49 20.9021 19.2941 20.7063C19.0983 20.5104 19.0004 20.275 19.0004 20C19.0004 19.725 19.0983 19.4896 19.2941 19.2938C19.49 19.0979 19.7254 19 20.0004 19C20.2754 19 20.5108 19.0979 20.7066 19.2938C20.9025 19.4896 21.0004 19.725 21.0004 20C21.0004 20.275 20.9025 20.5104 20.7066 20.7063C20.5108 20.9021 20.2754 21 20.0004 21ZM25.5389 21C25.2638 21 25.0284 20.9021 24.8326 20.7063C24.6368 20.5104 24.5388 20.275 24.5388 20C24.5388 19.725 24.6368 19.4896 24.8326 19.2938C25.0284 19.0979 25.2638 19 25.5389 19C25.8139 19 26.0493 19.0979 26.2451 19.2938C26.4409 19.4896 26.5389 19.725 26.5389 20C26.5389 20.275 26.4409 20.5104 26.2451 20.7063C26.0493 20.9021 25.8139 21 25.5389 21Z"/>
  </svg>

  {#if isSeeMoreButtonToggled && !isLanguageItemToggled && !isLocationItemToggled}
    <div bind:this={mainMenuRef} class="main-menu" style={calculateMenuPosition(seeMoreButtonRef, mainMenuRef)}>
      {#if isLoggedIn()}
        <button bind:this={languageItemRef} class="main-menu-item">
          <svg class="main-menu-icon">
            <path d="M11.9002 21.0003L16.2579 10.0003H17.2809L21.6386 21.0003H20.5579L19.3675 17.9503H14.1713L12.9809 21.0003H11.9002ZM4.01939 18.1157L3.31169 17.408L8.20787 12.4926C7.63735 11.9093 7.06972 11.1913 6.50497 10.3388C5.94023 9.48622 5.52197 8.70672 5.25017 8.00031H6.33094C6.57452 8.56056 6.94312 9.20415 7.43672 9.93108C7.9303 10.658 8.42324 11.2759 8.91554 11.7849C9.78606 10.9016 10.5588 9.93204 11.2338 8.87626C11.9088 7.82049 12.3579 6.86184 12.5809 6.00031H2.38477V5.00031H8.50017V3.76953H9.50017V5.00031H15.6156V6.00031H13.6194C13.3207 7.04646 12.8117 8.1612 12.0925 9.34453C11.3732 10.5279 10.5502 11.5811 9.62324 12.5042L12.1579 15.108L11.7732 16.1388L8.91554 13.2061L4.01939 18.1157ZM14.5079 17.0465H19.0309L16.7694 11.2349L14.5079 17.0465Z"/>
          </svg>
          <span class="main-menu-label">{_("language-item-label")}</span>
          <span class="main-menu-spacer"></span>
          <svg class="main-menu-icon">
            <path d="M13.2924 12.0001L8.69238 7.40008L9.40008 6.69238L14.7078 12.0001L9.40008 17.3078L8.69238 16.6001L13.2924 12.0001Z"/>
          </svg>
        </button>
        <button bind:this={locationItemRef} class="main-menu-item">
          <svg class="main-menu-icon">
            <path d="M12.0034 21C10.7588 21 9.58872 20.7638 8.4931 20.2915C7.39748 19.8192 6.44444 19.1782 5.63397 18.3685C4.82352 17.5588 4.18192 16.6066 3.70915 15.512C3.23638 14.4174 3 13.2479 3 12.0034C3 10.7588 3.23616 9.58872 3.70848 8.4931C4.18081 7.39748 4.82183 6.44444 5.63153 5.63398C6.44123 4.82353 7.39337 4.18192 8.48795 3.70915C9.58255 3.23638 10.7521 3 11.9966 3C13.2412 3 14.4113 3.23616 15.5069 3.70847C16.6025 4.18081 17.5556 4.82182 18.366 5.63152C19.1765 6.44122 19.8181 7.39337 20.2908 8.48795C20.7636 9.58255 21 10.7521 21 11.9966C21 13.2412 20.7638 14.4113 20.2915 15.5069C19.8192 16.6025 19.1782 17.5556 18.3685 18.366C17.5588 19.1765 16.6066 19.8181 15.512 20.2909C14.4174 20.7636 13.2479 21 12.0034 21ZM11 19.95V18C10.45 18 9.97917 17.8042 9.5875 17.4125C9.19583 17.0208 9 16.55 9 16V15L4.2 10.2C4.15 10.5 4.10417 10.8 4.0625 11.1C4.02083 11.4 4 11.7 4 12C4 14.0167 4.6625 15.7833 5.9875 17.3C7.3125 18.8167 8.98333 19.7 11 19.95ZM17.9 17.4C18.2333 17.0333 18.5333 16.6375 18.8 16.2125C19.0667 15.7875 19.2875 15.3458 19.4625 14.8875C19.6375 14.4292 19.7708 13.9583 19.8625 13.475C19.9542 12.9917 20 12.5 20 12C20 10.357 19.549 8.85651 18.6471 7.49852C17.7452 6.14054 16.5295 5.16155 15 4.56155V5C15 5.55 14.8042 6.02083 14.4125 6.4125C14.0208 6.80417 13.55 7 13 7H11V9C11 9.28333 10.9042 9.52083 10.7125 9.7125C10.5208 9.90417 10.2833 10 10 10H8V12H14C14.2833 12 14.5208 12.0958 14.7125 12.2875C14.9042 12.4792 15 12.7167 15 13V16H16C16.4333 16 16.825 16.1292 17.175 16.3875C17.525 16.6458 17.7667 16.9833 17.9 17.4Z"/>
          </svg>
          <span class="main-menu-label">{_("location-item-label")}</span>
          <span class="main-menu-spacer"></span>
          <svg class="main-menu-icon">
            <path d="M13.2924 12.0001L8.69238 7.40008L9.40008 6.69238L14.7078 12.0001L9.40008 17.3078L8.69238 16.6001L13.2924 12.0001Z"/>
          </svg>
        </button>
        <a href="https://netmate.app/settings" class="main-menu-item">
          <svg class="main-menu-icon">
            <path d="M10.1346 21L9.77306 18.1077C9.4539 18.0116 9.10873 17.8603 8.73756 17.6538C8.3664 17.4474 8.05073 17.2263 7.79056 16.9905L5.12306 18.125L3.25781 14.875L5.56356 13.1365C5.53406 12.9558 5.50973 12.7697 5.49056 12.578C5.47123 12.3863 5.46156 12.2001 5.46156 12.0192C5.46156 11.8512 5.47123 11.6747 5.49056 11.4895C5.50973 11.3042 5.53406 11.0955 5.56356 10.8635L3.25781 9.125L5.12306 5.9135L7.77131 7.02875C8.06998 6.78008 8.39306 6.55575 8.74056 6.35575C9.0879 6.15575 9.42565 6.00125 9.75381 5.89225L10.1346 3H13.8656L14.2271 5.9115C14.6104 6.04617 14.9491 6.20067 15.2433 6.375C15.5375 6.54933 15.8404 6.76725 16.1521 7.02875L18.8771 5.9135L20.7423 9.125L18.3596 10.9212C18.4147 11.1276 18.4456 11.317 18.4521 11.4895C18.4584 11.6618 18.4616 11.832 18.4616 12C18.4616 12.1552 18.4551 12.3189 18.4423 12.4913C18.4295 12.6637 18.4 12.8724 18.3538 13.1173L20.6981 14.875L18.8328 18.125L16.1521 16.9712C15.8404 17.2327 15.5269 17.4571 15.2116 17.6443C14.8962 17.8314 14.5681 17.9795 14.2271 18.0885L13.8656 21H10.1346ZM11.0001 20H12.9558L13.3251 17.2923C13.8289 17.1589 14.2824 16.9759 14.6856 16.7432C15.0889 16.5106 15.4995 16.1917 15.9173 15.7865L18.4116 16.85L19.4058 15.15L17.2173 13.5058C17.3006 13.2211 17.3558 12.9593 17.3828 12.7203C17.4096 12.4811 17.4231 12.241 17.4231 12C17.4231 11.7462 17.4096 11.5061 17.3828 11.2797C17.3558 11.0536 17.3006 10.8046 17.2173 10.5328L19.4443 8.85L18.4501 7.15L15.8981 8.21925C15.5956 7.88725 15.1978 7.576 14.7048 7.2855C14.212 6.99517 13.7456 6.80258 13.3058 6.70775L13.0001 4H11.0058L10.6943 6.6885C10.1905 6.79617 9.72731 6.96958 9.30481 7.20875C8.88248 7.44775 8.46231 7.77625 8.04431 8.19425L5.55006 7.15L4.55581 8.85L6.72506 10.4693C6.64173 10.6936 6.5834 10.9372 6.55006 11.2C6.51673 11.4628 6.50006 11.7359 6.50006 12.0192C6.50006 12.2731 6.51673 12.525 6.55006 12.775C6.5834 13.025 6.63531 13.2686 6.70581 13.5058L4.55581 15.15L5.55006 16.85L8.02506 15.8C8.4174 16.1962 8.82473 16.5138 9.24706 16.753C9.66956 16.992 10.1456 17.1782 10.6751 17.3115L11.0001 20ZM11.9731 14.5C12.6706 14.5 13.2616 14.2577 13.7463 13.773C14.2308 13.2885 14.4731 12.6975 14.4731 12C14.4731 11.3025 14.2308 10.7115 13.7463 10.227C13.2616 9.74233 12.6706 9.5 11.9731 9.5C11.2719 9.5 10.6799 9.74233 10.1971 10.227C9.7144 10.7115 9.47306 11.3025 9.47306 12C9.47306 12.6975 9.7144 13.2885 10.1971 13.773C10.6799 14.2577 11.2719 14.5 11.9731 14.5Z"/>
          </svg>
          <span class="main-menu-label">{_("settings-item-label")}</span>
        </a>
        <button class="main-menu-item">
          <svg class="main-menu-icon">
            <path d="M5.61538 20C5.15513 20 4.77083 19.8458 4.4625 19.5375C4.15417 19.2292 4 18.8449 4 18.3846V5.61537C4 5.15512 4.15417 4.77083 4.4625 4.4625C4.77083 4.15417 5.15513 4 5.61538 4H12.0192V5H5.61538C5.46154 5 5.32052 5.0641 5.1923 5.1923C5.0641 5.32052 5 5.46154 5 5.61537V18.3846C5 18.5385 5.0641 18.6795 5.1923 18.8077C5.32052 18.9359 5.46154 19 5.61538 19H12.0192V20H5.61538ZM16.4615 15.5385L15.7596 14.8192L18.0788 12.5H9.1923V11.5H18.0788L15.7596 9.18078L16.4615 8.46152L20 12L16.4615 15.5385Z"/>
          </svg>
          <span class="main-menu-label">{_("signout-item-label")}</span>
        </button>
      {:else}
        <button class="main-menu-item">
          <svg class="main-menu-icon">
            <path d="M11.5 16.5H12.5V11H11.5V16.5ZM12 9.57693C12.1744 9.57693 12.3205 9.51795 12.4385 9.4C12.5564 9.28205 12.6154 9.13589 12.6154 8.96152C12.6154 8.78718 12.5564 8.64102 12.4385 8.52307C12.3205 8.40512 12.1744 8.34615 12 8.34615C11.8256 8.34615 11.6795 8.40512 11.5615 8.52307C11.4436 8.64102 11.3846 8.78718 11.3846 8.96152C11.3846 9.13589 11.4436 9.28205 11.5615 9.4C11.6795 9.51795 11.8256 9.57693 12 9.57693ZM12.0034 21C10.7588 21 9.58872 20.7638 8.4931 20.2915C7.39748 19.8192 6.44444 19.1782 5.63397 18.3685C4.82352 17.5588 4.18192 16.6066 3.70915 15.512C3.23638 14.4174 3 13.2479 3 12.0034C3 10.7588 3.23616 9.58872 3.70848 8.4931C4.18081 7.39748 4.82183 6.44444 5.63153 5.63398C6.44123 4.82353 7.39337 4.18192 8.48795 3.70915C9.58255 3.23638 10.7521 3 11.9966 3C13.2412 3 14.4113 3.23616 15.5069 3.70847C16.6025 4.18081 17.5556 4.82182 18.366 5.63152C19.1765 6.44122 19.8181 7.39337 20.2908 8.48795C20.7636 9.58255 21 10.7521 21 11.9966C21 13.2412 20.7638 14.4113 20.2915 15.5069C19.8192 16.6025 19.1782 17.5556 18.3685 18.366C17.5588 19.1765 16.6066 19.8181 15.512 20.2909C14.4174 20.7636 13.2479 21 12.0034 21ZM12 20C14.2333 20 16.125 19.225 17.675 17.675C19.225 16.125 20 14.2333 20 12C20 9.76667 19.225 7.875 17.675 6.325C16.125 4.775 14.2333 4 12 4C9.76667 4 7.875 4.775 6.325 6.325C4.775 7.875 4 9.76667 4 12C4 14.2333 4.775 16.125 6.325 17.675C7.875 19.225 9.76667 20 12 20Z"/>
          </svg>
          <span class="main-menu-label">{_("announcements-item-label")}</span>
        </button>
      {/if}
      <div class="main-menu-links">
        {#each ["terms", "privacy", "contact"] as itemName}
          <a href="https://netmate.app/{itemName}" class="main-menu-link">{_(itemName + "-link-label")}</a>
        {/each}
      </div>
    </div>
  {/if}

  {#if isLoggedIn() && isLanguageItemToggled}
    <div bind:this={mainMenuLanguageMenuRef} class="language-menu" style={calculateMenuPosition(seeMoreButtonRef, mainMenuLanguageMenuRef)}>
      {#each LANGUAGES as language}
        <button class="language-menu-item" onclick={() => setLanguage(language)}>
          <span class="language-menu-label">{_(language)}</span>
        </button>
      {/each}
    </div>
  {/if}

  {#if isLoggedIn() && isLocationItemToggled}
    <div bind:this={mainMenuLocationMenuRef} class="location-menu" style={calculateMenuPosition(seeMoreButtonRef, mainMenuLocationMenuRef)}>
      {#each LOCATIONS as location}
        <button class="location-menu-item" onclick={() => setLocation(location)}>
          <span class="location-menu-label">{_(location)}</span>
        </button>
      {/each}
    </div>
  {/if}

  {#if isLoggedIn()}
    <a href="https://netmate.app/signin" class="signin-button">
      <span class="signin-button-label">{_("signin-button-label")}</span>
    </a>
  {/if}
  <Tooltip />
</div>

<style>
  .header {
    position: fixed;
    top: 8px;
    right: 16px;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .stateful-button {
    display: inline-flex;
    padding: 0.5rem;
    border-radius: 2rem;
    justify-content: center;
    align-items: center;
    gap: 0.25rem;
  }

  .stateful-button:hover {
    background-color: var(--dominant-color-hover);
  }

  .stateful-button-icon {
    width: 1.5rem;
    height: 1.5rem;
    fill: var(--secondary-color);
  }

  .current-state {
    font-family: Roboto;
    font-size: 0.75rem;
    color: var(--light-gray);
  }

  .language-menu {
    position: fixed;
    border-radius: 1rem;
    background-color: var(--dominant-color);
    box-shadow: var(--soft-shadow);
    padding: 0.5rem 0rem;
    display: grid;
    width: fit-content;
    overflow: hidden;
    z-index: 1;
  }

  .language-menu-item {
    display: flex;
    height: 2.5rem;
    padding: 0.5rem 1rem;
    align-items: center;
    gap: 0.5rem;
    align-self: stretch;
    cursor: pointer;
  }

  .language-menu-item:hover {
    background-color: var(--dominant-color-hover);
  }

  .language-menu-label {
    color: var(--secondary-color);
    font-family: var(--primary-font);
    font-size: 0.875rem;
    white-space: nowrap;
  }

  .location-menu {
    position: fixed;
    border-radius: 1rem;
    background-color: var(--dominant-color);
    box-shadow: var(--soft-shadow);
    padding: 0.5rem 0rem;
    display: grid;
    width: fit-content;
    overflow: hidden;
    z-index: 1;
  }

  .location-menu-item {
    display: flex;
    height: 2.5rem;
    padding: 0.5rem 1rem;
    align-items: center;
    gap: 0.5rem;
    align-self: stretch;
    cursor: pointer;
  }

  .location-menu-item:hover {
    background-color: var(--dominant-color-hover);
  }

  .location-menu-label {
    color: var(--secondary-color);
    font-family: var(--primary-font);
    font-size: 0.875rem;
    white-space: nowrap;
  }

  .main-menu {
    position: fixed;
    border-radius: 1rem;
    background-color: var(--dominant-color);
    box-shadow: var(--soft-shadow);
    display: inline-flex;
    padding: 0.5rem 0rem;
    flex-direction: column;
    align-items: center;
    z-index: 1;
  }

  .main-menu-item {
    display: flex;
    width: 12.875rem;
    padding: 0.5rem;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .main-menu-item:hover {
    background-color: var(--dominant-color-hover);
  }

  .main-menu-icon {
    width: 1.5rem;
    height: 1.5rem;
    fill: var(--secondary-color);
  }

  .main-menu-label {
    color: var(--secondary-color);
    font-family: var(--primary-font);
    font-size: 0.875rem;
    line-height: 1.3125rem;
  }

  .main-menu-spacer {
    flex: 1 0 0;
    align-self: stretch;
  }

  .main-menu-links {
    display: flex;
    width: 11.3125rem;
    padding-top: 0.25rem;
    justify-content: center;
    align-items: flex-start;
    align-content: flex-start;
    gap: 0rem 0.5rem;
    flex-wrap: wrap;
  }

  .main-menu-link {
    color: var(--light-gray);
    font-family: var(--primary-font);
    font-size: 0.75rem;
  }

  .main-menu-link:hover {
    text-decoration: underline;
  }

  .button {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    fill: var(--secondary-color);
    background-color: var(--dominant-color);
  }

  .button:hover, .button-toggled {
    background-color: var(--dominant-color-hover);
  }

  .handles-menu {
    position: fixed;
    border-radius: 1rem;
    background-color: var(--dominant-color);
    box-shadow: var(--soft-shadow);
    display: flex;
    width: 15rem;
    padding: 0.5rem 0rem;
    flex-direction: column;
    align-items: flex-start;
    z-index: 1;
  }

  .handles-menu-item {
    display: flex;
    padding: 0.25rem 0.75rem;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
  }

  .handles-menu-item:hover {
    background-color: var(--dominant-color-hover);
  }

  .handle-information {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .handle {
    color: var(--secondary-color);
    font-family: var(--primary-font);
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  .shares-count {
    color: var(--light-gray);
    font-family: var(--primary-font);
    font-size: 0.75rem;
  }

  .handle-operations-button {
    width: 2.125rem;
    height: 2.125rem;
    fill: var(--dark-gray);
    border-radius: 50%;
  }

  .new-handle-creator {
    display: flex;
    padding: 0rem 0.5rem;
    align-items: center;
    align-self: stretch;
  }

  .handle-menu-icon {
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    align-self: stretch;
    fill: var(--light-gray);
  }

  .new-handle-input {
    color: var(--secondary-color);
    font-family: var(--primary-font);
    font-size: 0.875rem;
  }

  .new-handle-input::placeholder {
    color: var(--light-gray);
    font-family: var(--primary-font);
    font-size: 0.875rem;
  }

  .handle-operations-button:hover {
    background-color: var(--dominant-color-hover);
  }

  .has-unread-announcement {
    fill: var(--accent-color);
  }

  .announcements-menu {
    position: fixed;
    border-radius: 1rem;
    background-color: var(--dominant-color);
    box-shadow: var(--soft-shadow);
    display: inline-flex;
    padding: 0.5rem 0rem;
    flex-direction: column;
    align-items: flex-start;
    z-index: 1;
  }

  .announcements-menu-item {
    display: flex;
    padding: 0.25rem 0.75rem;
    flex-direction: column;
    align-items: flex-start;
  }

  .announcements-menu-item:hover {
    background-color: var(--dominant-color-hover);
  }

  .announcements-menu-timestamp {
    color: var(--light-gray);
    font-family: var(--primary-font);
    font-size: 0.75rem;
  }

  .announcements-menu-title {
    color: var(--secondary-color);
    font-family: var(--primary-font);
    font-size: 0.875rem;
    line-height: 1.25rem;
    max-width: 17.5rem;
    white-space: nowrap;
  }

  .unread-announcement {
    color: var(--accent-color);
  }

  .signin-button {
    border-radius: 2rem;
    border: 1px solid var(--light-gray);
    height: 2.4375rem;
    background: var(--dominant-color);
    display: inline-flex;
    padding: 0.625rem 1rem 0.5625rem 1rem;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    color: var(--light-gray);
  }

  .signin-button-label {
    font-family: var(--primary-font);
    font-size: 0.9375rem;
    font-weight: 400;
    line-height: 1.25rem;
  }

  .signin-button:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
  }
</style>