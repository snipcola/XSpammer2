import { useState } from 'react';
import Layout from '../components/layout';
import { Context } from '../lib/context';

export default function Page ({ data }) {
  const [context, setContext] = useState(data);

  return (
    <Context.Provider value={[context, setContext]}>
      <Layout />
    </Context.Provider>
  )
};

export async function getStaticProps () {
  const data = {
    elementsDisabled: false,
    content: 'instances',
    sidebarDisabled: false,
    instance: {
      client: null,
      servers: null
    }
  };

  return {
    props: { data }
  };
};