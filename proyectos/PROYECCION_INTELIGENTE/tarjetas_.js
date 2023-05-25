const card = document.getElementById("card1");


card.addEventListener(
  "mouseover",
  (event) => {
    document.querySelector('#card1').classList.remove('.card1')
    document.querySelector('#card1').classList.add('.card1_')
  },
  true
);

