import axios from "axios";
import { JSDOM } from "jsdom";
import * as fs from "fs";

const restaurantsUrl =
  "http://www.comidadibuteco.com.br/category/butecos/rio-de-janeiro/";

const getRestaurants = async (url) => {
  return axios
    .get(url)
    .then((response) => {
       return parseHTML(response.data);
    })
    .catch(() => {
      console.log("Done!");
    });
};

const isAddress = (link) => {
  if (typeof link.href === "undefined") return false;

  return link.href.includes("https://www.google.com/maps/search");
};

const parseHTML = async (data) => {
  const dom = new JSDOM(data);

  const nodeList = [...dom.window.document.querySelectorAll("a")];
  
  const addressesLinks = nodeList.filter(isAddress);

  if (addressesLinks.length === 0) return '';

  let parsedAdresses = '';

  addressesLinks.forEach((link) => {
    const address = decodeURI(link).replace(
      "https://www.google.com/maps/search/?api=1&query=",
      ""
    );
    
    const [addressFirstLine, addressSecondLine] = address.split("|");
    const endereco = addressFirstLine;
    const [bairro, municipioEstado] = addressSecondLine != null ? addressSecondLine.trim().split(",") : [];
    const [municipio, estado] = municipioEstado != null ? municipioEstado.trim().split("-") : [];
  
    const newLine = `${endereco}\t${bairro}\t${municipio}\t${estado}\r\n`;
    parsedAdresses += newLine;
  });
  
  return parsedAdresses;
};

let thereIsMore = true;
let page = 1;

(async () => {
  while(thereIsMore) {
    const nextPage = page === 1 ? restaurantsUrl : `${restaurantsUrl}page/${page}/`;
    const restaurants = await getRestaurants(nextPage);
    fs.appendFileSync("./restaurants.txt", restaurants, { encoding: "utf8" });
    thereIsMore = restaurants != null && restaurants.length > 0;
    page++;
  }
})();


