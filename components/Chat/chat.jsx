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
    console.log('yo');

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
            id: 'welcome',
            role: 'assistant',
            parts: [{ type: 'text', text: 'Hi! How can I help you today?' }],
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
                      <button onClick=${() => onSuggestionClick(suggestion)}>
                        ${suggestion}
                      </button>
                    </li>`,
                ) : html`<li>No suggestions</li>`}
              </ul>
            `;
          },

          item(hit, { html, components }) {
            return html`
              <article>
                <img src="${hit.images[0].url}" alt="no-img" style={{ height: '150px' }} />
                <h2>${components.Highlight({ attribute: 'name', hit })}</h2>
                <p>${hit.description}</p>
                <p>${hit.price}</p>
                <a href="${hit.url}">View item</a>
              </article>
            `;
          },
          prompt: {
            header: (_, { html }) => html`<span>Ask me anything</span>`,
            footer: (_, { html }) => html`
              prompt footer
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
