<script lang="ts">
  import { registerInteractHandler } from "$lib/utils.svelte";
  import OperateHandleMenu from "./OperateHandleMenu.svelte";
  import { _, calculateMenuPosition } from "./nav.svelte";

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
    return [
      new Handle(14324, "--temp-anonymous", 341),
      new Handle(12434, "はらむらのどか", 543),
      new Handle(7373748, "のどっち", 2849),
    ];
  }

  const HANDLE_CREATION_LIMIT = 1 + 4;

  function canCreateNewHandle() {
    return handles().length < HANDLE_CREATION_LIMIT;
  }

  let { basePoint }: { basePoint: DOMRect } = $props();

  let menu: MaybeElement = $state(null);
  let operateHandleMenu: MaybeComponent = $state(null);
  export function contains(element: Element): boolean {
    return (
      (menu?.contains(element) ?? false) || operateHandleMenu?.contains(element)
    );
  }

  let isOperateHandleButtonToggled = $state(false);
  let isEditingHandle = $state(false);
  function onEdit() {
    isEditingHandle = true;
    inputValue = handles()[currentIndex].name;
    newHandle = "";
  }

  function isHandleEditing(index: number) {
    return isEditingHandle && currentIndex == index;
  }

  let operateHandleButtons: HTMLElement[] = [];
  let items: HTMLElement[] = [];
  let currentIndex = $state(0);
  function isIndexedButtonToggled(index: number) {
    return isOperateHandleButtonToggled && currentIndex == index;
  }

  // ハンドル編集時のinput関連
  let activeRenameInput: MaybeElement = $state(null);
  let inputValue = $state("");
  function autoFocusRenameInput() {
    $effect(() => {
      (activeRenameInput as HTMLInputElement)?.focus();
    });
  }
  autoFocusRenameInput();

  // 相互作用イベント関連
  function isInteractInsideOperateHandleMenu(element: Element): boolean {
    return operateHandleMenu?.contains(element);
  }

  function isInteractInsideActiveItem(element: Element): boolean {
    return items[currentIndex]?.contains(element);
  }

  function isInteractInsideActiveOperateHandleButton(
    element: Element,
  ): boolean {
    return operateHandleButtons[currentIndex]?.contains(element);
  }

  function handleInteractEvent(event: InteractEvent) {
    const element = event.target as Element;
    if (
      isOperateHandleButtonToggled &&
      !isInteractInsideOperateHandleMenu(element)
    ) {
      event.stopPropagation();
      event.preventDefault();
      if (isEditingHandle) {
        if (isInteractInsideActiveItem(element)) {
          if (isInteractInsideActiveOperateHandleButton(element)) {
            isEditingHandle = false;
            isOperateHandleButtonToggled = true;
          }
          return;
        } else {
          isEditingHandle = false;
        }
      }
      isOperateHandleButtonToggled = false;
    } else {
      for (var [index, button] of operateHandleButtons.entries()) {
        if (button && button.contains(element)) {
          event.stopPropagation();
          event.preventDefault();
          currentIndex = index;
          isOperateHandleButtonToggled = true;
          return;
        }
      }
    }
  }
  registerInteractHandler(handleInteractEvent);

  let newHandle = $state("");
  const HANDLE_LENGTH_LIMIT = 100;

  function currentCharactersCount() {
    return (isEditingHandle ? inputValue : newHandle).length;
  }

  function shouldDisplayCharactersCount(): boolean {
    return isEditingHandle || newHandle != "";
  }
</script>

<div
  bind:this={menu}
  class="menu"
  style={calculateMenuPosition(basePoint, menu)}
>
  {#each handles() as handle, index}
    <a
      bind:this={items[index]}
      href="https://netmate.app/handles/{handle.id}"
      class="item"
      class:toggle={isIndexedButtonToggled(index)}
      class:mode={isOperateHandleButtonToggled}
    >
      <div class="handle-information">
        {#if isHandleEditing(index)}
          <input
            bind:this={activeRenameInput}
            class="handle"
            id="handle{index}"
            type="text"
            bind:value={inputValue}
          />
        {:else}
          <span class="handle"
            >{handle.name == "--temp-anonymous"
              ? _("anonymous")
              : handle.name}</span
          >
        {/if}
        <span class="shares"
          >{_("shares-count", { count: handle.sharesCount })}</span
        >
      </div>
      {#if index != 0}
        <div
          bind:this={operateHandleButtons[index]}
          class="button"
          class:toggle={isIndexedButtonToggled(index) && !isEditingHandle}
          role="button"
          tabindex="0"
        >
          <svg class="icon">
            <use href="/src/lib/assets/common/more_horiz.svg#more_horiz"></use>
          </svg>
        </div>
      {/if}
    </a>
  {/each}
  {#if canCreateNewHandle()}
    <div class="new-handle-input">
      <svg class="input-icon" class:active={newHandle.length > 0}>
        <use href="/src/lib/assets/common/add.svg#add"></use>
      </svg>
      <div class="centered-input">
        <input
          class="input"
          placeholder={_("new-handle-input-placeholder")}
          bind:value={newHandle}
        />
      </div>
      {#if shouldDisplayCharactersCount()}
        <div class="bottomed-characters-counter">
          <span
            class="count"
            class:limit-over={(isEditingHandle ? inputValue : newHandle).length >
              HANDLE_LENGTH_LIMIT}>{currentCharactersCount()}</span
          >
          <span class="limit">/{HANDLE_LENGTH_LIMIT}</span>
        </div>
      {/if}
    </div>
  {/if}
</div>

{#if isOperateHandleButtonToggled && !isEditingHandle}
  <OperateHandleMenu
    bind:this={operateHandleMenu}
    basePoint={operateHandleButtons[currentIndex].getBoundingClientRect()}
    handleId={""}
    onEdit={() => onEdit()}
  />
{/if}

<style>
  .menu {
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

  .item {
    display: flex;
    padding: 0.25rem 0.75rem;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
  }

  .item:hover:not(.mode) {
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

  .shares {
    color: var(--light-gray);
    font-family: var(--primary-font);
    font-size: 0.75rem;
  }

  .button {
    width: 2.125rem;
    height: 2.125rem;
    fill: var(--dark-gray);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .button:hover,
  .toggle {
    background-color: var(--dominant-color-hover);
  }

  .icon {
    width: 1.5rem;
    height: 1.5rem;
    fill: var(--secondary-color);
  }

  .new-handle-input {
    display: flex;
    padding: 0.375rem 0.5rem;
    align-items: flex-start;
    align-self: stretch;
  }

  .input-icon {
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    align-self: stretch;
    fill: var(--light-gray);
    flex: 0 0 auto;
  }

  .active {
    fill: var(--secondary-color);
  }

  .centered-input {
    width: 100%;
    display: flex;
    padding: 0.1875rem 0rem;
    align-items: center;
    gap: 0.5rem;
  }

  .input {
    color: var(--secondary-color);
    font-family: var(--primary-font);
    font-size: 0.875rem;
    line-height: 1.1875rem;
  }

  .input::placeholder {
    color: var(--light-gray);
    font-family: var(--primary-font);
    font-size: 0.875rem;
  }

  .bottomed-characters-counter {
    display: flex;
    padding-bottom: 0.125rem;
    align-items: flex-end;
    align-self: stretch;
    flex: 0 0 1;
  }

  .count,
  .limit {
    color: var(--light-gray);
    font-family: Roboto;
    font-size: 0.875rem;
    line-height: 1.1875rem;
  }

  .limit-over {
    color: var(--warning-color-hover);
  }
</style>
