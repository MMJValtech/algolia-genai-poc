"use client";

import { useEffect, useRef } from "react";
import { liteClient as algoliasearch } from "algoliasearch/lite";
import instantsearch from "instantsearch.js";
import { chatInlineLayout } from "instantsearch.js/es/templates";
import { chat } from "instantsearch.js/es/widgets";
import "./chat.css";
import { carousel } from 'instantsearch.js/es/templates/index.js'


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
        getSearchPageURL: (nextUiState) => `/search?${qs.stringify(nextUiState)}`,
        initialMessages: [
          {
            text: "Hi! How can I help you today?"
          },
        ],
        initialUserMessage: 'Show me a few popular products to get started.',
        templates: {
          layout: chatInlineLayout(),
          carousel: carousel(),
          header: {
            titleIcon: (_, { html }) => html`<span>The Gift Advisor</span>`,
            titleText: 'Iconic Gifts for Every Occasion',
          },

          suggestions({ suggestions, onSuggestionClick }, { html }) {
            return html`
              <ul>
                ${suggestions?.length > 0 ? suggestions.map(
                  (suggestion) =>
                    html`<li>
                      <button onClick=${() => onSuggestionClick(suggestion)} class="ais-ChatPromptSuggestions-suggestion">
                        ${suggestion}
                      </button>
                    </li>`,
                ) : html`<li>No suggestions</li>`}
              </ul>
            `;
          },

          item(hit, { html, components }) {
            const title = hit.name.split(':')[0];
            const subtitle = hit.name.split(':')[1];
            return html`
                <a href="${hit?.relativeUrls?.l2Url ?? '#'}">
                  <div class="ais-Carousel-image">
                    <img src="${hit.images[0].url}" />
                    ${hit.images[1]?.url && html`<div class="ais-Carousel-item-image-overlay">
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
