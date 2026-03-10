import OBR from "https://cdn.skypack.dev/@owlbear-rodeo/sdk";

await OBR.onReady();

const METADATA_KEY = "cameraFollowState";

// Verifica se é GM
const role = await OBR.player.getRole();
const isGM = role === "GM";

const followBtn = document.getElementById("follow");
const stopBtn = document.getElementById("stop");

followBtn.disabled = !isGM;
stopBtn.disabled = !isGM;

// ===== BACKEND (STATE DA CENA) =====
async function setState(state) {
  await OBR.scene.setMetadata({
    [METADATA_KEY]: state
  });
}

function getState(metadata) {
  return metadata[METADATA_KEY] || {
    active: false,
    tokenId: null
  };
}

// ===== CONTROLE DO GM =====
followBtn.onclick = async () => {
  const selection = await OBR.player.getSelection();

  if (selection.length !== 1) {
    alert("Selecione exatamente um token.");
    return;
  }

  await setState({
    active: true,
    tokenId: selection[0]
  });
};

stopBtn.onclick = async () => {
  await setState({
    active: false,
    tokenId: null
  });
};

// ===== CLIENTES ESCUTANDO O BACKEND =====
let currentState = {
  active: false,
  tokenId: null
};

OBR.scene.onMetadataChange((metadata) => {
  currentState = getState(metadata);
});

// ===== SEGUIR O TOKEN =====
OBR.scene.items.onChange(async (items) => {
  if (!currentState.active || !currentState.tokenId) return;

  const token = items.find(item => item.id === currentState.tokenId);
  if (!token || !token.position) return;

  await OBR.viewport.animateTo({
    position: token.position,
    scale: null,
    duration: 120
  });
});
''