import React from "react";
import { EditorView, Decoration, ViewPlugin, WidgetType } from "@codemirror/view";

import { EditorState, RangeSetBuilder } from "@codemirror/state";
import { basicSetup } from "codemirror";
import { autocompletion, CompletionContext } from "@codemirror/autocomplete";

class VariableWidget extends WidgetType {
  constructor(
    private type: "g" | "l",
    private name: string
  ) {
    super();
  }

  eq(other: VariableWidget) {
    return this.type === other.type && this.name === other.name;
  }

  toDOM() {
    const span = document.createElement("span");
    span.textContent = `${this.type}.${this.name}`;
    span.className =
      this.type === "g" ? "var-global" : "var-local";
    return span;
  }

  ignoreEvent() {
    return false;
  }
}

const variablePlugin = ViewPlugin.fromClass(
  class {
    decorations;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView) {
      const builder = new RangeSetBuilder<Decoration>();
      const text = view.state.doc.toString();

      const regex = /\$\{([gl])\.([a-zA-Z_]\w*)\}/g;
      let match;

      while ((match = regex.exec(text))) {
        const full = match[0];
        const type = match[1]; // g / l
        const start = match.index;
        const end = start + full.length;

        builder.add(
          start,
          end,
          Decoration.replace({
            widget: new VariableWidget(type, match[2])
            }
          )
        );
      }

      return builder.finish();
    }
  },
  {
    decorations: v => v.decorations,
  }
);

const variableCompletion = autocompletion({
  activateOnTyping: true,
  override: [
    (ctx: CompletionContext) => {
      const word = ctx.matchBefore(/[gl]\.\w*/);
      if (!word) return null;

      const isGlobal = word.text.startsWith("g.");

      return {
        from: word.from + 2, // ⭐ 保证补全能触发
        options: (isGlobal
          ? ["userId", "token", "env"]
          : ["count", "index", "item"]
        ).map(v => ({
          label: v,
          type: "variable",
          apply: (view) => {
            const prefixFrom = word.from;
            const prefixTo = word.from + 2;

            view.dispatch({
              changes: {
                from: prefixFrom,
                to: word.to,
                insert: `\${${isGlobal ? "g" : "l"}.${v}}`,
              },
            });
          },
        })),
      };
    },
  ],
});



export default function VariableEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        variablePlugin,
        variableCompletion,
        EditorView.updateListener.of(v => {
          if (v.docChanged) {
            onChange(v.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: ref.current,
    });

    return () => view.destroy();
  }, []);

  return <div ref={ref} />;
}
