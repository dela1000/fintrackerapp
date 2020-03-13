import _ from 'lodash';

const customPalette = [ "#F8CBAD", "#F4B084", "#FFD966", "#BDD7EE", "#9BC2E6", "#FCE4D6", "#F8CBAD", "#B58AC8", "#D0CECE", "#AEAAAA", "#FFE699", "#11A4A3", "#FFC54D", "#0294A5", "#A79C93", "#C1403D", "#6C6B74", "#2E30E3", "#9199BE", "#54678F", "#212624", "#594346", "#212027", "#F22F08", "#8D2F23", "#561E18", "#1B1924", "#B5C1B4", "#DCD9C6", "#74593D", "#3F3232", "#EB2D26", "#0A4D78"];

export function defineColors(categories) {
  let definedColors = {};
  _.forEach(categories, (cat, i) => {
    definedColors[cat.id] = {
      color: customPalette[i],
      category: cat.name,
      id: cat.id,
    }
  })
  return definedColors;
}

export const colors = customPalette;