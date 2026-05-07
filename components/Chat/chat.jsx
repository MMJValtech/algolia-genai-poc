"use client";

import { useEffect, useRef } from "react";
import { liteClient as algoliasearch } from "algoliasearch/lite";
import instantsearch from "instantsearch.js";
import { chatInlineLayout } from "instantsearch.js/es/templates";
import { chat } from "instantsearch.js/es/widgets";
import "./chat.css";
import { carousel } from 'instantsearch.js/es/templates/index.js'

/** Display label + image in suggestions; `prompt` is what gets sent when clicked. */
const STARTER_SUGGESTIONS = [
  {
    prompt: "Romantic Gifts to Celebrate Every Anniversary",
    label: "Romantic Gifts to Celebrate Every Anniversary",
    imageUrl:
      "https://media.tiffany.com/is/image/tco/2025_HOLIDAY_STILL_1x1_9-3",
  },
  {
    prompt: "Timeless Gifts to Commemorate any Milestone",
    label: "Timeless Gifts to Commemorate any Milestone",
    imageUrl:
      "https://media.tiffany.com/is/image/tco/2025_HOLIDAY_STILL_1x1_5-4",
  },
  {
    prompt: "Wedding & Engagement Gifts to Cherish",
    label: "Wedding & Engagement Gifts to Cherish",
    imageUrl:
      "https://media.tiffany.com/is/image/tcoqa/45752661_RG_SIO2X1?hei=1204&wid=1204&fmt=webp&op_usm=1%2C2%2C6",
  },
  {
    prompt: "The perfect \"Just Because\" to Add to Your Collection",
    label: "The perfect \"Just Because\" to Add to Your Collection",
    imageUrl:
      "https://media.tiffany.com/is/image/tco/2025_HOLIDAY_STILL_4X5_14-1",
  },
];

const starterSuggestionPrompts = STARTER_SUGGESTIONS.map((s) => s.prompt);
const starterSuggestionByPrompt = Object.fromEntries(
  STARTER_SUGGESTIONS.map((s) => [s.prompt, s]),
);

const appID = process.env.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID;
const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY;
const agentId = process.env.NEXT_PUBLIC_AGENT_ID;

export default function Chat() {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    console.log('yo, Mr White!');

    const searchClient = algoliasearch(appID, apiKey);
    const search = instantsearch({ searchClient });

    search.addWidgets([
      chat({
        container: el,
        agentId,
        resume: false,
        getSearchPageURL: (nextUiState) => {
          const params = new URLSearchParams();
          Object.entries(nextUiState).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            params.set(
              key,
              typeof value === "object" ? JSON.stringify(value) : String(value),
            );
          });
          return `/search?${params.toString()}`;
        },
        messages: [
          {
            id: "welcome",
            role: "assistant",
            parts: [
              {
                type: "text",
                text: [
                  "Hi! Choose a category below or ask anything in your own words.",
                ].join("\n"),
              },
              {
                type: "data-suggestions",
                data: { suggestions: starterSuggestionPrompts },
              },
            ],
          },
        ],
        templates: {
          layout: chatInlineLayout(),
          carousel: carousel(),
          header: {
            titleIcon: (_, { html }) => html`<span>The Gift Advisor</span>`,
            titleText: 'Iconic Gifts for Every Occasion',
          },

          suggestions({ suggestions, onSuggestionClick }, { html }) {
            return html`
              <ul class="ais-ChatPromptSuggestions-cards" role="list">
                ${suggestions?.length > 0
                  ? suggestions.map((prompt) => {
                    console.log(prompt);
                      const meta = starterSuggestionByPrompt[prompt];
                      const label = meta?.label ?? prompt;
                      const imageUrl = meta?.imageUrl;
                      console.log(label);
                      console.log(imageUrl);
                      if (imageUrl) {
                      return html`<li>
                        <button
                          type="button"
                          class="ais-ChatPromptSuggestions-card"
                          onClick=${() => onSuggestionClick(prompt)}
                        >
                          ${imageUrl
                            ? html`<span class="ais-ChatPromptSuggestions-card-image">
                                <img src="${imageUrl}" alt="" loading="lazy" />
                              </span>`
                            : null}
                          <span class="ais-ChatPromptSuggestions-card-label"
                            >${label}</span
                          >
                        </button>
                      </li>`;
                      }
                      return html`<li>
                        <button
                          type="button"
                          class="ais-ChatPromptSuggestions-text-card"
                          onClick=${() => onSuggestionClick(prompt)}
                        >
                          <span class="ais-ChatPromptSuggestions-text-card-label">${label}</span>
                        </button>
                      </li>`;
                    })
                  : null}
              </ul>
            `;
          },

          item(hit, { html, components }) {
            const title = hit.name?.split(':')[0];
            const subtitle = hit.name?.split(':')[1];
            return html`
                <a href="${hit?.relativeUrls?.l2Url ?? '#'}">
                  <div class="ais-Carousel-image">
                    
                    ${hit.images[1]?.url && html`<img src="${hit.images[0].url}" />
                      <div class="ais-Carousel-item-image-overlay">
                      <img src="${hit.images[1]?.url}" />
                    </div>`}
                    ${hit?.variationsAvailable?.materials > 1 && html`<div class="ais-Carousel-item-image-materials">
                     ${hit?.variationsAvailable?.materials} Materials
                    </div>`}
                  </div>
                  <h4 class="ais-Carousel-title">${title}</h4>
                  <p class="ais-Carousel-subtitle">${subtitle}</p>
                  ${hit.price?.default && html`<p class="ais-Carousel-price">$${hit.price?.default}</p>`} 
                </a>
            `;
          },
          prompt: {
            header: (_, { html }) => html`<span>Need help finding the perfect gift?</span>`,
            footer: (_, { html }) => html`
              <p class="ais-ChatPrompt-footer-text"></p>
            `,
          },
          loaderText: 'Thinking...',
          
        },
      }),
    ]);

    search.start();

    return () => {
      search.dispose();
    };
  }, []);

  return <div ref={containerRef} id="chat" />;
}
