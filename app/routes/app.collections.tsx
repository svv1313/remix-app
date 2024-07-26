import { Card, Layout, Page } from "@shopify/polaris";
import { apiVersion, authenticate } from "../shopify.server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const query = `
{
    collections(first: 10) {
        edges {
            node {
                id
                title
            }
        }
    }
}
`;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop, accessToken } = session;
  try {
    if (!accessToken) {
      console.error("Access token is not found");
      return;
    }

    const response = await fetch(
      `https://${shop}/admin/api/${apiVersion}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/graphql",
          "X-Shopify-Access-Token": accessToken,
        },
        body: query,
      },
    );
    if (response.ok) {
      const jsonData = await response.json();
      return jsonData.data.collections.edges;
    }
  } catch (error) {
    console.error(error);
  }
  return null;
};

export default function CollectionsPage() {
  const collections: any = useLoaderData();

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <h1>Collection</h1>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <ul>
              {collections.map((collection: any) => (
                <li key={collection.node.id}>{collection.node.title}</li>
              ))}
            </ul>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
