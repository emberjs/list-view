export default function makeModel(small = false) {
  var model = [];
  for (var i = 0; i < 100000; i++) {
    model.push({
      name: `Item ${i+1}`,
      imageSrc: (small ? smallImages : images)[i%images.length]
    });
  }
  return model;
}

export var images = [
  'images/ebryn.jpg',
  'images/iterzic.jpg',
  'images/kselden.jpg',
  'images/machty.jpg',
  'images/rwjblue.jpg',
  'images/stefanpenner.jpg',
  'images/tomdale.jpg',
  'images/trek.jpg',
  'images/wagenet.jpg',
  'images/wycats.jpg'
];

var smallImages = [
  'images/small/Ba_Gua_Feng-Shui-Mirror.gif',
  'images/small/Bonsai.gif',
  'images/small/Chouchin_Reinensai_Lantern.gif',
  'images/small/Chouchin_Kuroshiro_Lantern_.gif',
  'images/small/Chouchin_Shinku_Lantern.gif',
  'images/small/Fuurin_Glass_Wind_Chime.gif',
  'images/small/Geta_Wooden_Sandal_.gif',
  'images/small/Gunsen_Fan_.gif',
  'images/small/iChing_Kouka_Heads-Coin.gif',
  'images/small/iChing_Kouka_Tails_Coin.gif',
  'images/small/Ishidourou_Snow_Lantern.gif',
  'images/small/Kakejiku_Hanging_Scroll.gif',
  'images/small/Katana_and_Sheath.gif',
  'images/small/Kimono_Buru_Blue.gif',
  'images/small/Kimono_Chairo_Tan.gif',
  'images/small/Koi.gif',
  'images/small/Shamisen.gif',
  'images/small/Shodou_Calligraphy.gif',
  'images/small/Torii.gif',
  'images/small/Tsukubai_Water_Basin.gif'
];

export var types = [
  {id:  1, type: "cat",   name: "Andrew"},
  {id:  2, type: "cat",   name: "Andrew"},
  {id:  3, type: "cat",   name: "Bruce"},
  {id:  4, type: "other", name: "Xbar"},
  {id:  5, type: "dog",   name: "Caroline"},
  {id:  6, type: "cat",   name: "David"},
  {id:  7, type: "other", name: "Xbar"},
  {id:  8, type: "other", name: "Xbar"},
  {id:  9, type: "dog",   name: "Edward"},
  {id: 10, type: "dog",   name: "Francis"},
  {id: 11, type: "dog",   name: "George"},
  {id: 12, type: "other", name: "Xbar"},
  {id: 13, type: "dog",   name: "Harry"},
  {id: 14, type: "cat",   name: "Ingrid"},
  {id: 15, type: "other", name: "Xbar"},
  {id: 16, type: "cat",   name: "Jenn"},
  {id: 17, type: "cat",   name: "Kelly"},
  {id: 18, type: "other", name: "Xbar"},
  {id: 19, type: "other", name: "Xbar"},
  {id: 20, type: "cat",   name: "Larry"},
  {id: 21, type: "other", name: "Xbar"},
  {id: 22, type: "cat",   name: "Manny"},
  {id: 23, type: "dog",   name: "Nathan"},
  {id: 24, type: "cat",   name: "Ophelia"},
  {id: 25, type: "dog",   name: "Patrick"},
  {id: 26, type: "other", name: "Xbar"},
  {id: 27, type: "other", name: "Xbar"},
  {id: 28, type: "other", name: "Xbar"},
  {id: 29, type: "other", name: "Xbar"},
  {id: 30, type: "other", name: "Xbar"},
  {id: 31, type: "cat",   name: "Quincy"},
  {id: 32, type: "dog",   name: "Roger"},
  ];
