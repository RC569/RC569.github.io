let bltable;
let tbody; // for ai slop code
let originalRows; // for ai slop code

tablediv = document.getElementById('backlog');
var datasource = localStorage.getItem("datasource");
sourceButton = document.querySelector(".sourceButton")

serverbl = "/resources/backlog.md"
githubbl = "https://raw.githubusercontent.com/RC569/backlog/main/backlog.md"

function get_datasource() {
    return localStorage.getItem("datasource");
}

function change_datasource() {
    if (datasource === serverbl) {
        localStorage.setItem("datasource", githubbl);
    } else {
        localStorage.setItem("datasource", serverbl);
    }
    edit_button_visibility()
    location.reload();
}

function init_datasource() {
    if (!datasource) {
        localStorage.setItem("datasource", serverbl);
        datasource = get_datasource();
        console.log(`Changed datasource to ${datasource}`)
    }
}

function edit_button_visibility() {
    get_datasource()
    editbutton = document.querySelector(".editButton")
    if (datasource === githubbl) {
        editbutton.style.display = "block";
    } else {
        editbutton.style.display = "none";
    }
}

async function get_backlog() {
    try {
        const r = await fetch(datasource);
        if (!r.ok) {
            if (r.status === 404) return backlogdata = `${datasource} replied with status code 404. if this is ${serverbl}, it might not be on the server.`
            throw new Error(`status: ${r.status}`);
        }
        backlogdata = await r.text();
        return backlogdata
    } catch (error) {
        console.error(error.message);
    }
}

async function make_table() {
    backlogdata = await get_backlog()

    if (!backlogdata) return;

    tablediv.innerHTML = marked.parse(backlogdata);

    bltable = tablediv.querySelector("table")
    tbody = document.querySelector("tbody"); // for ai slop code
    originalRows = Array.from(tbody.rows); // for ai slop code

    get_full_playtime(); // for ai slop code
}

// make backlog table :)
if (!datasource) {
    init_datasource();
    make_table();
} else {
    get_datasource();
    if (datasource === githubbl) sourceButton.querySelector(".sourcename").innerHTML = ` ${serverbl}`;
    edit_button_visibility()
    make_table();
}

function changeFontSize(how) {
    if (!bltable.style.fontSize) {
        bltable.style.fontSize = "16px"
    }

    if (how === "increase") {
        newFontSize = Number(bltable.style.fontSize.replace("px", ""))+1+"px";
        bltable.style.fontSize=newFontSize;
    }
    if (how === "decrease") {
        newFontSize = Number(bltable.style.fontSize.replace("px", ""))-1+"px";
        bltable.style.fontSize=newFontSize;
    }
}

// Everything below this comment is AI slop. :(
// saving this link here for when i'm in the mood to unsloppify this https://stackoverflow.com/questions/9640266/convert-hhmmss-string-to-seconds-only-in-javascript

function get_full_playtime() {
    const rows = bltable.querySelectorAll("tr");
    let totalSeconds = 0;

    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        if (cells.length < 4) return;

        const lengthText = cells[3].textContent.trim();

        const match = lengthText.match(/^(\d+):(\d{2}):(\d{2})$/);
        if (!match) return;

        const [, h, m, s] = match.map(Number);
        totalSeconds += h * 3600 + m * 60 + s;
    });

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const totalLength =
        `${String(hours).padStart(2, "0")}:` +
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}`;

    lengthtxt = document.querySelector('.totallength')
    lengthtxt.innerHTML = totalLength
}

let sortMode = "initial"; // "initial" "longToShort" "shortToLong"

function timeToSeconds(str) {
    const [h, m, s] = str.trim().split(":").map(Number);
    return h * 3600 + m * 60 + s;
}

function sortTableByLength() {
    sortMode =
        sortMode === "initial" ? "longToShort" :
        sortMode === "longToShort" ? "shortToLong" :
        "initial";

    console.log("Sort mode:", sortMode);


    const rows = Array.from(tbody.rows);

    switch (sortMode) {
        case "initial":
            originalRows.forEach(row => tbody.appendChild(row));
            break;

        case "longToShort":
            rows
                .sort((a, b) =>
                    timeToSeconds(b.cells[3].textContent) -
                    timeToSeconds(a.cells[3].textContent)
                )
                .forEach(row => tbody.appendChild(row));
            break;

        case "shortToLong":
            rows
                .sort((a, b) =>
                    timeToSeconds(a.cells[3].textContent) -
                    timeToSeconds(b.cells[3].textContent)
        )
        .forEach(row => tbody.appendChild(row));
        break;
    }
}
