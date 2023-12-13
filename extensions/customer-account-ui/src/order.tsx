import {
    reactExtension,
    Banner,
    useOrder,
    Button,
    useApi,
    useTotalAmount,
  } from '@shopify/ui-extensions-react/customer-account';
  
  export default reactExtension(
    'customer-account.order-status.block.render',
    () => <Extension />,
  );
  
  function Extension() {
    const order = useOrder();
    const cost = useTotalAmount();
    const textAmount = `${cost.amount}`
    const parameters = new URLSearchParams({
        vendorid: "2578995",
        order_id: order.id.split("Order/")[1],
        order_amount: textAmount,
    })
      //return `https://finanzieren.consorsfinanz.de/web/ecommerce/gewuenschte-rate?${parameters}`
        const link = `https://finanzieren.consorsfinanz.de/web/ecommerce/gewuenschte-rate?${parameters}`
    if (order) {
      return (
        <Button to={link}>Jetzt Finanzieren mit Consors Finanz</Button>
      );
    }
  
    return null;
  }
  