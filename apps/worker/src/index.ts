
import express from 'express'
import {createClient} from 'redis'


const main = async () => {
    const client = await createClient()
    client.connect()
    
    while(true) {
        const response = await client.brPop('submissions', 0);
        console.log("Response", response);

        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log("Processed users submission")
    }
}

main()