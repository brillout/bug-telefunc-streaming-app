import useQuery from '@/hooks/useQuery';
import { loadPartialMergedCount } from "./index.telefunc";
import Cookies from 'universal-cookie';
import React from "react";
import { Counter } from "./Counter";

export default function Page() {
  const cookies = new Cookies();
  cookies.set('test', 'alternate');

  const { data, isRefetching, refetch } = useQuery(loadPartialMergedCount, {});

  return (
    <>
      <h1>My Vike app</h1>
      This page is:
      <ul>
        <li>Rendered to HTML.</li>
        <li>
          Interactive. <Counter />
        </li>
      </ul>
    </>
  );
}
