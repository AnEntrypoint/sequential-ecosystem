// Facade maintaining 100% backward compatibility with basic UI builders
import { createButton as buildButton } from './button-builder.js';
import { createCard as buildCard } from './card-builder.js';
import { createInput as buildInput } from './input-builder.js';
import { createSelect as buildSelect } from './select-builder.js';
import { createCheckbox as buildCheckbox } from './checkbox-builder.js';
import { createRadio as buildRadio } from './radio-builder.js';
import { createBadge as buildBadge } from './badge-builder.js';

export const createButton = buildButton;
export const createCard = buildCard;
export const createInput = buildInput;
export const createSelect = buildSelect;
export const createCheckbox = buildCheckbox;
export const createRadio = buildRadio;
export const createBadge = buildBadge;
