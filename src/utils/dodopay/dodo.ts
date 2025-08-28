import axios from "axios";
import DodoPayments from "dodopayments";
import dotenv from 'dotenv'
dotenv.config()
export default interface CustomerReturnDodoType{
    customer_id:string,
    business_id:string
    name:string
    email:string
    phone_number:string
    created_at:string
}
export const dodo=new DodoPayments({bearerToken:process.env.NEXT_DODO_PAYMENT_KEY})
export const createCustomer=async (email:string)=>{
    try {
        const customer=await axios.post("https://test.dodopayments.com/customers",{
            email,
            name:email
        },{
            headers:{
                "Authorization":`Bearer ${process.env.NEXT_DODO_PAYMENT_KEY}`
            }
        })
        console.log("the customer data is ",customer.data as CustomerReturnDodoType)
        return customer.data as CustomerReturnDodoType
    } catch (error) {
        console.log("An error occured during customer creation",error)
        throw new Error("Customer creation failed")
    }
}