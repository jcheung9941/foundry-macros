const dialog = { modifier: 0, edge: { checked: 0, mod: 0, text: "Edge" }, }

await Dialog.prompt({
    title: 'Roll',
    content: `<form>
      <div class="form-group"><label>Modifier:</label>
          <div class="form-fields"><input name="mod" type="number" value="0" /></div>
      </div>
      <div class="form-group"><label>Edge/Bane:</label>
        <select>
          <option>Edge</option>
          <option>Bane</option>
        </select>
        <input name="edge" type="checkbox" value=false />
        <input name="edge" type="checkbox" value=false />
      </div>
  </form>`,
    callback: html => {
        dialog.modifier = html.find('input[name=mod]').val()
        for (let i = 0; i < 2; i++) { if (html.find('input[name=edge]')[i].checked) { dialog.edge.checked++ } }
        if (dialog.edge.checked === 1) { dialog.edge.mod = 2 } else if (dialog.edge.checked === 2) { dialog.edge.edge = true }
        if (html.find('select').val() === "Bane") { dialog.edge.mod = dialog.edge.mod * -1; dialog.edge.text = "Bane" }

    },
    close: () => null,
    rejectClose: false
})

const rollEdge = dialog.edge.mod ? `+ ${dialog.edge.mod}[${dialog.edge.text}]` : ""
const rollMod = dialog.modifier != 0 ? `+ ${dialog.modifier}[mod]` : ""
const roll = await new Roll(`2d10 ${rollMod} ${rollEdge}`).roll({ async: true })
let tier = 1
let text = ""

if (roll.total >= 12 && roll.total <= 16) {
    tier = 2
} else if (roll.total >= 17) {
    tier = 3
}

if (dialog.edge.edge && dialog.edge.text === "Bane") {
    tier = Math.max(tier - 1, 1)
    text = `<div style=color:red>Bane Tier down in effect</div><hr/>`
} else if (dialog.edge.edge) {
    tier = Math.min(tier + 1, 3)
    text = `<div style=color:green>Edge Tier up in effect</div><hr/>`
} else if (Math.abs(dialog.edge.mod) === 2) {
    text = `${dialog.edge.text} in effect<hr/>`
}

ChatMessage.create({
    roll: roll,
    content: `${await roll.render()}<br/><div style="text-align:center"><strong>Result Tier${tier}</strong><br/></div><hr/>${text}`,
    sound: CONFIG.sounds.dice,
    type: CONST.CHAT_MESSAGE_TYPES.ROLL
})