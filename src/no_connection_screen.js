

var bg_panel = document.createElement("div")
bg_panel.style.width = "100%";
bg_panel.style.height = "100%";
bg_panel.style.position = "absolute";
bg_panel.style.top = "0px";
bg_panel.style.left = "0px";
bg_panel.style.backgroundColor = "#292b2c";
bg_panel.style.zIndex = "2077";

bg_panel.style.display = "flex";
bg_panel.style.justifyContent = "center";
bg_panel.style.alignItems = "center";
bg_panel.style.flexDirection = "column";
bg_panel.style.userSelect = "none";

var text = document.createElement("div");
text.innerText = "Wystąpił błąd. Proszę zawiadomić osobę prowadzącą eksperyment."
text.style.color = "#d9534f";
text.style.margin = "0 0";
text.style.fontSize = "3rem";
text.style.fontWeight = "bold";

var subtext = document.createElement("div");
subtext.innerText = "(Brak połączenia z bazą danych)"
subtext.style.color = "#f7f7f7";
subtext.style.margin = "0 0";
subtext.style.fontSize = "2rem";
subtext.style.fontWeight = "bold";

bg_panel.appendChild(text);
bg_panel.appendChild(subtext)

document.getElementsByTagName("ytd-app")[0].remove();
document.body.appendChild(bg_panel);




