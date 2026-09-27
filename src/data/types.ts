export type Species = "dog" | "cat";

export type Regulatory = "label" | "extra-label" | "anecdotal" | "unspecified";

export type Dosage = {
  species: Species;
  indication_ru: string;
  dose: string;
  route_ru: string;
  frequency_ru: string;
  duration_ru: string;
  regulatory: Regulatory;
  variant: string;
  notes_ru: string;
  source_en: string;
};

export type Interaction = {
  with_en: string;
  with_ru: string;
  effect_ru: string;
};

export type Drug = {
  id: string;
  name_en: string;
  name_ru: string;
  pronunciation: string;
  synonyms_en: string[];
  trade_names: string[];
  class_en: string;
  class_ru: string;
  species: Species[];
  no_dog_cat_dose: boolean;
  highlights: string[];
  indications: string;
  pharmacology: string;
  pharmacokinetics: string;
  contraindications: string;
  adverse_effects: string;
  reproductive_safety: string;
  overdose: string;
  interactions: Interaction[];
  lab_considerations: string[];
  dosages: Dosage[];
  monitoring: string[];
  client_info: string[];
  storage: string;
  dosage_forms: string[];
  stewardship_ru: string;
};
