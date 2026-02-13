import { BlockStack, Text, reactExtension } from "@shopify/ui-extensions-react/checkout";

export default reactExtension("purchase.checkout.delivery-address.render-after", () => (
  <W3WSkeleton />
));

function W3WSkeleton() {
  return (
    <BlockStack spacing="tight">
      <Text emphasis="bold">what3words (optional)</Text>
      <Text>Checkout UI extension scaffold is active.</Text>
    </BlockStack>
  );
}
