//to add new ability, copy an existing ability and paste it in, be sure to also capture the }, at the end
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
ChatMessage.create({
    roll: roll,
    content: await roll.render(),
    sound: CONFIG.sounds.dice,
    type: CONST.CHAT_MESSAGE_TYPES.ROLL
})

const results = {
    tier: 1,
    text: `T1: ${abilities[dialog.name].tier1} <br/> T2: ${abilities[dialog.name].tier2} <br/> T3: ${abilities[dialog.name].tier3} <br/> Effect: ${abilities[dialog.name].effect}`
}

if (roll.total >= 12 && roll.total <= 16) {
    results.tier = 2
} else if (roll.total >= 17) {
    results.tier = 3
}
if (dialog.edge.edge && dialog.edge.text === "Bane") {
    results.tier = Math.max(results.tier - 1, 1)
    results.text = `Bane Tier down in effect<hr/> ${results.text}`
} else if (dialog.edge.edge) {
    results.tier = Math.min(results.tier + 1, 3)
    results.text = `Edge Tier up in effect<hr/> ${results.text}`
}
ChatMessage.create({ content: `<em>${dialog.name}</em><hr/><strong>Result Tier${results.tier}</strong><br/>${abilities[dialog.name][`tier${results.tier}`]}<hr/>${results.text}` })