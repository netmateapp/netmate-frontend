<script lang="ts">
  import { _, calculateMenuPosition } from "../editor.svelte";

  // タグ関連
  class Tag {
    constructor(
      public id: string,
      public displayName: string,
      public disambiguation: string = "",
    ) {}
    isEmpty(): boolean {
      return this.id === "" && this.displayName === "";
    }
    hasDisambiguation(): boolean {
      return this.disambiguation !== "";
    }
  }

  class TagInput {
    tag: Tag;
    ref: MaybeHTMLInputElement = $state(null);
    value: string = $state("");

    constructor() {
      this.tag = new Tag("", "");
    }

    getRef(): HTMLInputElement {
      return this.ref as HTMLInputElement;
    }
  }

  const TAG_LIMIT = 5;
  const TAG_CHARACTERS_COSTS_LIMIT = 100;
  let tagInputs: TagInput[] = $state([new TagInput()]);

  // リアクティブである必要
  function shouldDisplayTagPlaceholder(): boolean {
    return tagInputs.length < 2 && tagInputs[0].value === "";
  }

  let debounceTimer: NodeJS.Timeout;
  const debounceInterval = 300;
  function onInputTag(event: InputEvent, input: TagInput) {
    const inputValue = (event.target as HTMLInputElement).value;
    clearInterval(debounceTimer);
    if (inputValue.includes("　")) {
      //confirmTagInput(event, input);
      console.log("zenkaku");
      return;
    }

    debounceTimer = setTimeout(() => {
      performTagSearch(inputValue, input);
    }, debounceInterval);

    strechInput(input.getRef());
  }

  function strechInput(input: HTMLInputElement) {
    const tempSpan = document.createElement("span");
    tempSpan.style.visibility = "hidden";
    tempSpan.style.whiteSpace = "pre";
    tempSpan.style.fontSize = getComputedStyle(input).fontSize;
    tempSpan.style.fontFamily = getComputedStyle(input).fontFamily;
    tempSpan.style.fontWeight = getComputedStyle(input).fontWeight;
    tempSpan.textContent = input.value;

    document.body.appendChild(tempSpan);

    const newWidth = tempSpan.getBoundingClientRect().width + 16;
    input.style.width = `${newWidth}px`;

    document.body.removeChild(tempSpan);
  }

  // キャッシュをつけたい
  let suggestionFor: TagInput = $state(tagInputs[0]);
  let suggestedTags: Tag[] = $state([]);
  let inputsToLastSuggestions = new Map<TagInput, Tag[]>();
  let canDisplayTagSuggestions = $state(false);
  const SUGGESTION_TRIGGER_THERESHOLD = 2;
  function performTagSearch(query: string, input: TagInput) {
    if (query.length < SUGGESTION_TRIGGER_THERESHOLD) return;

    // fetch(search?query=...)
    // then(data => displaySuggestions(data))
    canDisplayTagSuggestions = true;

    suggestionFor = input;
    suggestedTags = [
      new Tag("aaa", query + "aaaa"),
      new Tag("bbbb", query + "bbbb"),
    ];
    inputsToLastSuggestions.set(input, suggestedTags);
  }

  function shouldDisplayTagSuggestions(): boolean {
    return canDisplayTagSuggestions;
  }

  function onKeydownInTagInput(event: KeyboardEvent, input: TagInput) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      confirmInput(input, event.key === "Enter" ? "enter" : "space");
    }
  }

  function onFocusTagInput(event: Event, input: TagInput) {
    if (suggestionFor === input) canDisplayTagSuggestions = true;
  }

  function onBlurTagInput(input: TagInput) {
    if (shouldIgnoreBlurEvent) return;
    //canDisplayTagSuggestions = false;
    confirmInput(input, "click");
  }

  type ConfirmCause = "enter" | "space" | "click";

  // タグ入力を快適に行えるようにするための処理
  function confirmInput(input: TagInput, cause: ConfirmCause) {
    closeTagSuggestions();
    runWithoutBlurEvent(() => input.getRef().blur());
    if (!isInputEmpty(input)) {
      if (!isTagLimitReached()) {
        if (isLastInputEmpty()) {
          lastInput().getRef().focus();
        } else {
          const newInput = appendNewTagInput();
          if (cause !== "click") {
            setSuggestionsFor(newInput);
            clearSuggestions();
            setTimeout(() => {
              newInput.getRef().focus();
            }, 100);
          }
        }
      }
    } else {
      if (!isLastInput(input)) {
        const shouldAppendNewInput = !isLastInputEmpty();
        removeInput(input);
        if (shouldAppendNewInput) appendNewTagInput();
      }
    }
  }

  const EMPTY_OR_WHITESPACES_REGEX = /\s+/;
  function isInputEmpty(input: TagInput): boolean {
    const value: string = input.value;
    return value.length == 0 || EMPTY_OR_WHITESPACES_REGEX.test(input.value);
  }

  function isLastInputEmpty(): boolean {
    return isInputEmpty(lastInput());
  }

  function closeTagSuggestions() {
    canDisplayTagSuggestions = false;
  }

  let shouldIgnoreBlurEvent = false;
  function runWithoutBlurEvent(runnable: () => void) {
    shouldIgnoreBlurEvent = true;
    runnable();
    shouldIgnoreBlurEvent = false;
  }

  function isTagLimitReached(): boolean {
    return tagInputs.length == TAG_LIMIT;
  }

  function appendNewTagInput(): TagInput {
    const input = new TagInput();
    tagInputs.push(input);
    return input;
  }

  function setSuggestionsFor(input: TagInput) {
    suggestionFor = input;
  }

  function clearSuggestions() {
    suggestedTags = [];
  }

  function lastInput(): TagInput {
    return tagInputs[tagInputs.length - 1];
  }

  function isLastInput(input: TagInput): boolean {
    return lastInput() === input;
  }

  function removeInput(input: TagInput) {
    tagInputs = tagInputs.filter((i) => i != input);
    setSuggestionsFor(tagInputs[0]);
    clearSuggestions();
  }

  let tagSuggestionsRef: MaybeHTMLElement = $state(null);
  function currentTagInputDOMRect(): DOMRect {
    return (
      suggestionFor.ref?.getBoundingClientRect() ??
      (tagSuggestionsRef as HTMLElement).getBoundingClientRect()
    );
  }
</script>

<div class="tags">
  {#if shouldDisplayTagPlaceholder()}
    <div class="placeholder">{_("to-tag")}</div>
  {/if}
  {#each tagInputs as tagInput (tagInput)}
    <input
      bind:this={tagInput.ref}
      class="tag"
      type="text"
      bind:value={tagInput.value}
      maxlength={TAG_CHARACTERS_COSTS_LIMIT}
      oninput={(event) => onInputTag(event as unknown as InputEvent, tagInput)}
      onkeydown={(event) => onKeydownInTagInput(event, tagInput)}
      onfocus={(event) => onFocusTagInput(event, tagInput)}
      onblur={() => onBlurTagInput(tagInput)}
    />
  {/each}
  {#if shouldDisplayTagSuggestions()}
    <div
      bind:this={tagSuggestionsRef}
      class="tag-suggestions"
      style={calculateMenuPosition(
        currentTagInputDOMRect(),
        tagSuggestionsRef,
      )}
    >
      {#each suggestedTags as suggestedTag}
        <div class="tag-suggestion">
          <span class="suggested-tag-name"
            >{suggestedTag.displayName}</span
          >
          <span class="suggested-tag-disambiguation"
            >{suggestedTag.disambiguation}</span
          >
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .tags {
    position: relative;
    width: 100%;
    min-height: 1.25rem;
    display: flex;
    align-items: flex-start;
    align-content: flex-start;
    gap: 0.5rem 0rem;
    align-self: stretch;
    flex-wrap: wrap;
  }

  .placeholder {
    position: absolute;
    top: 0px;
    color: var(--light-gray);
    font-family: var(--primary-font);
    font-size: 0.9375rem;
    pointer-events: none;
    white-space: nowrap;
  }

  .tag {
    width: 8rem;
    min-width: 2rem;
    color: var(--accent-color);
    font-family: var(--primary-font);
    font-size: 0.9375rem;
    line-height: 1.25rem;
  }

  .tag-suggestions {
    position: fixed;
    min-width: 10rem;
    border-radius: 1rem;
    background-color: var(--dominant-color);
    box-shadow: var(--soft-shadow);
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    z-index: 2;
    overflow: hidden;
  }

  .tag-suggestion {
    display: flex;
    padding: 0.5rem;
    align-items: center;
    align-self: stretch;
    cursor: pointer;
  }

  .tag-suggestion:hover {
    background-color: var(--dominant-color-hover);
  }

  .suggested-tag-name {
    max-width: 11.25rem;
    color: var(--secondary-color);
    font-family: var(--primary-font);
    font-size: 0.9375rem;
    line-height: 1.25rem;
    word-break: break-all;
  }

  .suggested-tag-disambiguation {
    color: var(--light-gray);
    font-family: var(--primary-font);
    font-size: 0.75rem;
  }
</style>