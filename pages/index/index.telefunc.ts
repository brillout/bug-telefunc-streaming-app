import { getContext } from 'telefunc';

export async function loadPartialMergedCount() {
  const { calculation } = getContext();

  if (calculation === 'alternative') {
    console.log('yay it works');
  }
}
