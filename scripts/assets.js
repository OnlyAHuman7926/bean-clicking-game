const bgm = document.getElementById("bgm");
const audios = {
  SCORE: "./assets/get_score.mp3",
  EXPLODE: "./assets/explode.mp3",
  GOOD_CLICKED: "./assets/good_clicked.mp3",
  TARO_CLICKED: "./assets/taro_clicked.mp3",
  GLASS_APPEAR: "./assets/glass_appear.mp3",
  BOUNCE: "./assets/collision.mp3",
  SHOOT: "./assets/shoot.mp3",
  HIT: "./assets/hit.mp3",
  DUNE: "./assets/dune.mp3",
  WOOOSH: "./assets/wooosh.mp3",
};
const beanURLs = {
  GREEN_1: "./assets/green_bean_1.svg",
  GREEN_2: "./assets/green_bean_2.svg",
  YELLOW_1: "./assets/yellow_bean_1.svg",
  YELLOW_2: "./assets/yellow_bean_2.svg",
  ORANGE_1: "./assets/orange_bean_1.svg",
  ORANGE_2: "./assets/orange_bean_2.svg",
  RED_1: "./assets/red_bean_1.svg",
  RED_2: "./assets/red_bean_2.svg",
  MINT_1: "./assets/mint_bean_1.svg",
  MINT_2: "./assets/mint_bean_2.svg",
  BLUE_1: "./assets/blue_bean_1.svg",
  BLUE_2: "./assets/blue_bean_2.svg",
  TARO_1: "./assets/taro_bean_1.svg",
  TARO_2: "./assets/taro_bean_2.svg",
  GOLD_1: "./assets/gold_bean_1.svg",
  GOLD_2: "./assets/gold_bean_2.svg",
  PINK_1: "./assets/pink_bean_1.svg",
  PINK_2: "./assets/pink_bean_2.svg",
  COLORLESS_1: "./assets/colorless_bean_1.svg",
  COLORLESS_2: "./assets/colorless_bean_2.svg",
  WHITE_1: "./assets/white_bean_1.svg",
  WHITE_2: "./assets/white_bean_2.svg",
  BROWN_1: "./assets/brown_bean_1.svg",
  BROWN_2: "./assets/brown_bean_2.svg",
  METALLIC_GREEN_1: "./assets/metallic_green_bean_1.svg",
  METALLIC_GREEN_2: "./assets/metallic_green_bean_2.svg",
  GRAY_1: "./assets/grey_bean_1.svg",
  GRAY_2: "./assets/grey_bean_2.svg",
  UNDECIDED: "./assets/bg_1.jpg",
  OLD: "./assets/old-bean.png", 
};
const effectImgs = {
  FREEZE: "./assets/freeze.svg",
  DOUBLE: "./assets/double.svg",
  CLOVER: "./assets/clover.svg",
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