import { i18n } from "./utils/i18n";

const itemTypes = [
  "weapon",
  "equipment",
  "consumable",
  "tool",
  "backpack",
  "loot",
];

const displayNames = {
  weapon: "Weapon",
  equipment: "Equipment",
  consumable: "Consumable",
  tool: "Tool",
  backpack: "Container",
  loot: "Loot",
};

const faIcons = {
  weapon: "fist-raised",
  equipment: "tshirt",
  consumable: "bomb",
  tool: "tools",
  backpack: "suitcase",
  loot: "gem",
};

const closeDropdown = ($dropDown) => {
  $dropDown.removeClass("is-open");
  $dropDown.css({ maxHeight: 0, paddingTop: 0, paddingBottom: 0 });
  setTimeout(() => {
    if (!$dropDown.hasClass("is-open")) {
      $dropDown.offset({ top: 0, left: 0 });
    }
  }, 300);
};

export const initItemChanger = () => {
  Hooks.on("renderItemSheet", (app, html, data) => {
    const openBtn = $(`<a
        class="open-changer-dropdown"
        title="Open Change Dropdown">
        <i class="fas fa-random"></i>
        ${i18n("5eItemChanger.ui.handle")}
      </a>`);
    openBtn.on("click", function () {
      const $openBtn = $(this);
      const $container = $openBtn.parent(".changer-container");
      const $dropDown = $container.children(".dropdown-body");

      if ($dropDown.hasClass("is-open")) {
        closeDropdown($dropDown);
        return;
      }

      const containerOffset = $container.offset();
      const containerHeight = $container.height();
      const dropdownOffsetTop = containerOffset.top + containerHeight / 2 + 15;
      $dropDown.addClass("is-open");
      $dropDown.offset({ top: dropdownOffsetTop, left: containerOffset.left });
      $dropDown.css({ maxHeight: 400, paddingTop: 8, paddingBottom: 8 });
    });
    const container = $(
      '<div class="changer-container" style="max-width:104px;"><style type="text/css">.changer-button:hover{background: rgba(0,0,0,1) !important;}</style></div>'
    );
    const dropdownBody = $('<div class="dropdown-body"></div>');
    dropdownBody.css({
      position: "fixed",
      zIndex: 1000,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      width: 200,
      maxHeight: 0,
      transition: "max-height .3s, padding-top .3s, padding-bottom .3s",
      background: "rgba(0,0,0,0.55)",
      border: "solid 1px rgba(0,0,0,0.8)",
      overflow: "hidden",
    });
    const changerButtons = itemTypes.map((type) => {
      const button = $(
        `<div
          class="changer-button"
          data-type="${type}">
          <span>${displayNames[type]}</span>
          <div style="display:flex; height: 100%; width: 32px; align-items: center; justify-content: center;">
            <i class="fas fa-${faIcons[type]}"></i>
          </div>
        </div>`
      );
      button.css({
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        color: "white",
        padding: "2px 8px",
        cursor: "pointer",
        background: "transparent",
        transition: "background .3s",
      });
      button.on("click", function () {
        const $button = $(this);
        const newType = $button.attr("data-type");
        const $dropDown = $button.parents(".dropdown-body");
        const $itemWindow = $button.parents(".app.window-app.dnd5e.sheet.item");
        const id = $itemWindow.attr("id");
        if (!id) throw Error("id on item window not found");
        const itemId = id.split("item-")[1];
        const actorId = id.split("actor-")[1].split("-item")[0];
        if (!itemId) throw Error(`no item ID found: ${id}`);
        const actor = game.actors.get(actorId, {});
        const item = actor.items.filter(
          (item) => item.data._id === itemId
        )[0] as Item;
        if (!item) throw Error(`no item with id ${itemId} found`);
        const newData = { type: newType } as any;
        if (newType === "equipment") {
          newData.data = { armor: { type: "clothing", value: 10 } };
        }
        if (newType === "weapon") {
          newData.data = {
            properties: {
              fin: false,
              lgt: false,
              thr: false,
              amm: false,
              hvy: false,
              fir: false,
              foc: false,
              lod: false,
              rch: false,
              rel: false,
              ret: false,
              spc: false,
              two: false,
              ver: false,
            },
          };
        }
        item.update(newData, {});
        // item.data.type = newType;

        closeDropdown($dropDown);
      });
      return button;
    });
    container.append(openBtn);
    for (const button of changerButtons) {
      dropdownBody.append(button);
    }
    container.append(dropdownBody);
    html.closest(".app").find(".changer-container").remove();
    let titleElement = html
      .closest(".app.dnd5e.sheet.item")
      .find(".window-title");
    container.insertAfter(titleElement);
  });
};
