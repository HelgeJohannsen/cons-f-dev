import {
  Banner,
  Button,
  Image,
  InlineLayout,
  reactExtension,
  useApi,
  useOrder,
  useTotalAmount,
} from "@shopify/ui-extensions-react/customer-account";

export default reactExtension(
  "customer-account.order-status.block.render",
  () => <Extension />
);

function Extension() {
  const order = useOrder();
  const cost = useTotalAmount();
  const textAmount = `${cost.amount}`;
  const order_id = order.id.split("Order/")[1];
  const parameters = new URLSearchParams({
    vendorid: "8403",
    order_id: order_id,
    order_amount: textAmount,
    notifyURL: `https://cons-f-dev.cpro-server.de/api/public/notify/${order_id}`,
  });
  //return `https://finanzieren.consorsfinanz.de/web/ecommerce/gewuenschte-rate?${parameters}`
  const link = `https://finanzieren.consorsfinanz.de/web/ecommerce/gewuenschte-rate?${parameters}`;
  if (order) {
    return (
      <InlineLayout
        columns={["45%", "50%"]}
        spacing={"base"}
        blockAlignment={"center"}
        inlineAlignment={"center"}
      >
        <Image source="https://cdn.shopify.com/s/files/1/0758/3137/8199/files/ConsorsFinanzLogo.png?v=1701077799" />
        <Button to={link}>Jetzt Finanzieren mit Consors Finanz</Button>
      </InlineLayout>
    );
  }

  return null;
}

/*
  [ ] Check the if the payment method is form Consors
  [ ] Get the vendorId from the backend and use a manual value as a backup
  [ ] Remember to change the manual vendorID on this file
*/
