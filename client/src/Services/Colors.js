import _ from 'lodash';

const colors = [
  {color: "#F8CBAD"},
  {color: "#F4B084"},
  {color: "#FFD966"},
  {color: "#BDD7EE"},
  {color: "#9BC2E6"},
  {color: "#FCE4D6"},
  {color: "#F8CBAD"},
  {color: "#B58AC8"},
  {color: "#D0CECE"},
  {color: "#AEAAAA"},
  {color: "#FFE699"},
  {color: "#EB2D26"},
  {color: "#0A4D78"},
  {color: "#11A4A3"},
  {color: "#FFC54D"},
  {color: "#0294A5"},
  {color: "#A79C93"},
  {color: "#C1403D"},
  {color: "#6C6B74"},
  {color: "#2E30E3"},
  {color: "#9199BE"},
  {color: "#54678F"},
  {color: "#212624"},
  {color: "#594346"},
  {color: "#212027"},
  {color: "#F22F08"},
  {color: "#8D2F23"},
  {color: "#561E18"},
  {color: "#1B1924"},
  {color: "#B5C1B4"},
  {color: "#DCD9C6"},
  {color: "#74593D"},
  {color: "#3F3232"},
];


export function defineColors(categories) {
  let definedColors = {};
  _.forEach(categories, (cat, i) => {
    let color = colors[i];
    definedColors[cat.id] = color;
  })
  return definedColors;
}