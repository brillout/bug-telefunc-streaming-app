import { getContext } from 'telefunc';

export async function loadPartialMergedCount() {
  console.log('============ getContext() 1')
  const { calculation } = getContext();
  console.log('======== getContext() 2')

  if (calculation === 'alternative') {
    console.log('yay it works');
  }
}
