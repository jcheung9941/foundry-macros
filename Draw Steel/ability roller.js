//to add new ability, copy an existing ability and paste it in, be sure to also capture the }, at the end..some
//modify the name, putting it in quotes and ending with :{ example: [ "something something":{ ]
//modify tier 1-3 and effect, be sure to enclose the text with " and end the line with , example: [ tier1:"something something something", ]
const abilities = {

    //first ability start
    "Protective Strike": {
        tier1: "7 damage",
        tier2: "10 damage",
        tier3: "13 damage",
        effect: "The target is taunted (EoT)",
    },
    //first ability end

    "Protective Strike2": {
        tier1: "4 damage",
        tier2: "12 damage",
        tier3: "103 damage",
        effect: "The target is taunted (EoD)",
    },
    "Not Protective Strike": {
        tier1: "Nothing interesting happens",
        tier2: "Something happens",
        tier3: "Something really good happens",
        effect: "You sink their battleship",
    },
}

const dialog = { name: "error", modifier: 0, edge: { checked: 0, mod: 0, text: "Edge" }, }

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
      <div class="form-group"><label>Ability:</label>
        <select name="ability">
          ${Object.keys(abilities).map((element) => { return `<option>${element}</option>` })}
        </select>
      </div>
  </form>`,
    callback: html => {
        dialog.name = html.find('select[name=ability]')[0].value
        dialog.modifier = html.find('input[name=mod]').val()
        for (let i = 0; i < 2; i++) { if (html.find('input[name=edge]')[i].checked) { dialog.edge.checked++ } }
        if (dialog.edge.checked === 1) { dialog.edge.mod = 2 } else if (dialog.edge.checked === 2) { dialog.edge.edge = true }
        if (html.find('select').val() === "Bane") { dialog.edge.mod = dialog.edge.mod * -1; dialog.edge.text = "Bane" }

    },
    close: () => null,
    rejectClose: false
})

let roll = await new Roll(`2d10 + ${dialog.modifier}[mod] + ${dialog.edge.mod}[${dialog.edge.text}]`).roll({ async: true })
let tier = 1
let text = ""

if (roll.total >= 12 && roll.total <= 16) {
    tier = 2
} else if (roll.total >= 17) {
    tier = 3
}

if (dialog.edge.edge && dialog.edge.text === "Bane") {
    tier = Math.max(tier - 1, 1)
    text = `Bane Tier down in effect<hr/>`
} else if (dialog.edge.edge) {
    tier = Math.min(tier + 1, 3)
    text = `Edge Tier up in effect<hr/>`
} else if (Math.abs(dialog.edge.mod) === 2) {
    text = `${dialog.edge.text} in effect<hr/>`
}

for (let i = 1; i < 4; i++) {
    let line = `Tier${i}: ${abilities[dialog.name][`tier${i}`]} <br/>`
    if (tier != i) {
        text = text + line
    } else {
        text = `${text} <strong>${line}</strong>`
    }
}
text = `${text} Effect: ${abilities[dialog.name].effect}`

ChatMessage.create({
    roll: roll,
    content: `
    <div style="text-align:center"><br/><em><strong>${dialog.name}</strong></em> ${await roll.render()} <br/><strong>Result Tier${tier}</strong><br/>${abilities[dialog.name][`tier${tier}`]}</div><hr/>${text}`,
    sound: CONFIG.sounds.dice,
    type: CONST.CHAT_MESSAGE_TYPES.ROLL
})