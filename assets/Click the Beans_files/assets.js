const bgm = document.getElementById("bgm");
const audios = {
  SCORE: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/get_score.mp3",
  EXPLODE: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/explode.mp3",
  GOOD_CLICKED: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/good_clicked.mp3",
  TARO_CLICKED: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/taro_clicked.mp3",
  GLASS_APPEAR: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/glass_appear.mp3",
  BOUNCE: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/collision.mp3",
  SHOOT: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/shoot.mp3",
  HIT: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/hit.mp3",
  DUNE: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/dune.mp3",
  WOOOSH: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/wooosh.mp3",
};
const beanURLs = {
  GREEN_1: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/green_bean_1.svg",
  GREEN_2: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/green_bean_2.svg",
  YELLOW_1: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/yellow_bean_1.svg",
  YELLOW_2: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/yellow_bean_2.svg",
  ORANGE_1: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/orange_bean_1.svg",
  ORANGE_2: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/orange_bean_2.svg",
  RED_1: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/red_bean_1.svg",
  RED_2: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/red_bean_2.svg",
  MINT_1: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/mint_bean_1.svg",
  MINT_2: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/mint_bean_2.svg",
  BLUE_1: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/blue_bean_1.svg",
  BLUE_2: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/blue_bean_2.svg",
  TARO_1: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/taro_bean_1.svg",
  TARO_2: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/taro_bean_2.svg",
  GOLD_1: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/gold_bean_1.svg",
  GOLD_2: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/gold_bean_2.svg",
  PINK_1: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/pink_bean_1.svg",
  PINK_2: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/pink_bean_2.svg",
  COLORLESS_1: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/colorless_bean_1.svg",
  COLORLESS_2: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/colorless_bean_2.svg",
  WHITE_1: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/white_bean_1.svg",
  WHITE_2: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/white_bean_2.svg",
  BROWN_1: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/brown_bean_1.svg",
  BROWN_2: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/brown_bean_2.svg",
  METALLIC_GREEN_1: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/metallic_green_bean_1.svg",
  METALLIC_GREEN_2: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/metallic_green_bean_2.svg",
  GRAY_1: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/grey_bean_1.svg",
  GRAY_2: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/grey_bean_2.svg",
  UNDECIDED: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/bg_1.jpg",
  OLD: "https://cdn.glitch.global/3f91a446-12a3-477c-bcd8-b6a6b81bf31d/bean.png", 
};
const effectImgs = {
  FREEZE: "https://cdn.glitch.global/3f91a446-12a3-477c-bcd8-b6a6b81bf31d/freeze.svg",
  DOUBLE: "https://cdn.glitch.global/3f91a446-12a3-477c-bcd8-b6a6b81bf31d/double.svg",
  CLOVER: "https://cdn.glitch.global/83eba652-1502-4a22-8def-dcd5c7c84364/clover.svg",
  SHIELD: "https://p3.ssl.qhimg.com/t110b9a93018a3afe8b56430ec8.webp", // 360
};

let allResources = [audios, beanURLs, effectImgs];

async function loadURLasBlob(url) {
  let response = await fetch(url);
  let blob = await response.blob();
  return URL.createObjectURL(blob);
}

async function loadAll() {
  let loadDisp = document.getElementById("load-progress");
  let totalResources = 0;
  let finishedResources = 0;
  let errorResources = 0;
  for (let part of allResources) totalResources += Object.keys(part).length;
  loadDisp.innerHTML = (errorResources > 0 ? errorResources + "; " : "") + finishedResources + " / " + totalResources;
  
  for (let part of allResources) {
    for (let key in part) {
      try {
        let url = await loadURLasBlob(part[key]);
        part[key] = url;
        finishedResources++;
      } catch {
        errorResources++;
      }
      loadDisp.innerHTML = loadDisp.innerHTML = (errorResources > 0 ? errorResources + "; " : "") + finishedResources + " / " + totalResources;
    }
  }
}

window.onload = () => loadAll();

function playAudio(url) {
  if (cleanMode) return;
  
  const audio = new Audio(url);
  audio.autoplay = true;
  audio.addEventListener('ended', () => {
    audio.remove();
  });
  audio.addEventListener('error', (e) => {
    console.error(e);
  });
}