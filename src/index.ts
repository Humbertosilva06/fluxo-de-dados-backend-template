import express, { Request, Response } from 'express'
import cors from 'cors'
import { accounts } from './database'
import { ACCOUNT_TYPE } from './types'
import { log } from 'console'


// PRATICA GUIADA 01: REFATORAR O ENDPOINT GET ACCOUINT BY ID
// refatorar para o bloco try/catch. Validação de resultado: caso nenhuma account seja encontrada na pesquisa por id, retornar erro 404. Mensagem de erro: conta não encontrada. Verifique a id

// PRATICA GUIADA 2: REFATORAR O ENDPOINT DELETE ACCOUNT
// poderiamos fazer a mesma logica da pratica anterior, mas vamos focar em outra logica para praticar
//toda id de conta deve começar com a letra "a". refatorar para o bloco try catch; validação de input: caso a id recebida não inicie com a letra a , serrá retornado o erro 400, mensagem de erro "id invalida, deve começar com a letra a"

//PRATICA GUIADA 03: REFATORAR O ENDPOINT EDIT ACCOUNT
//Agora emtramos num endpoint com body, aqui a validação fica mais intensa pois todos os valores do body devem ser verificados. o foco será no body, não precisa de fluxos de erro para o path params id como nas praticas anteriores.
// req.body.balance (newBalance) - deve ser number; deve ser maior ou igual a 
//req.body.type (newType) - deve valer um dos tipos da conta enum

// FIXAÇÃO
//implemente as seguintes validações em edit account: req.body.id = string que inicia com a letra "a"; req.body.ownername = string com no minimo 2 carcteres
const app = express()

app.use(express.json())
app.use(cors())

app.listen(3003, () => {
    console.log("Servidor rodando na porta 3003")
})

app.get("/ping", (req: Request, res: Response) => {
    res.send("Pong!")
})

app.get("/accounts", (req: Request, res: Response) => {
    res.send(accounts)
})

//pratica 01
app.get("/accounts/:id", (req: Request, res: Response) => {

    try {


        const id = req.params.id

        const result = accounts.find((account) => account.id === id)


        // se o resultado for undefined ele entra no if, o throw new Error interrompe o codigo e o catch é executado
        if (!result) {
            //podemos personalizar o status tbm, no catch só colocar o res.send que ele ja vai com o status tbm
            res.status(404)
            //nos ifs, eu posso passar uma mensagem personalizada de erro dentro do Error("") e chamar la no catch como send.(err.mesage)(o err pode ser qualquer nome)
            throw new Error("conta não encontrada, verifique id")
        }

        res.status(200).send(result)

    } catch (err) {

        //podemos tratar ainda mais o status digamos que por algum motivo ele veio como 200, dizemos que se for igual a 200 ele recebera o valor 500. (caso eu comente a personalização do status dentro do if ele cai aqui)
        if (res.statusCode === 200) {
            res.status(500)
        }

        // o err faz referencia ao throw new Error()
        console.log(err)
        res.send(err.message)
    }

})


//pratica 02
app.delete("/accounts/:id", (req: Request, res: Response) => {

    try {
        //temos que verificar se a primeira letra do id é "a". uma strinf é um array de caracteres, então podemos passar id[0]
        const id = req.params.id

        if (id[0] !== "a") {
            res.status(400)
            throw new Error("Id invalido, deve inaciar com a letra a")
        }

        const accountIndex = accounts.findIndex((account) => account.id === id)

        // o findindex retorna o valor do index. caso não ache ele retorna -1, isso faria no splice o ultimo elemento do array ser deletado, porntanto primeiro fazemos uma verificação se ele é menor que 0 ou se ele é undefined (!accountIndex)

        if (!accountIndex || accountIndex < 0) {

            res.status(404)
            throw new Error("conta não encontrada, verifique o id")

        } else {
            accounts.splice(accountIndex, 1)
            res.status(200).send("Item deletado com sucesso")
        }



    } catch (err) {

        if (res.statusCode === 200) {
            res.status(500)
        }

        console.log(err)
        res.send(err.message)
    }




    //forma anterior
    // const id = req.params.id

    // const accountIndex = accounts.findIndex((account) => account.id === id)

    // if (accountIndex >= 0) {
    //     accounts.splice(accountIndex, 1)
    // }

    // res.status(200).send("Item deletado com sucesso")
})

//pratica 03
app.put("/accounts/:id", (req: Request, res: Response) => {

    try {
        const id = req.params.id

        const newId = req.body.id as string | undefined
        const newOwnerName = req.body.ownerName as string | undefined
        const newBalance = req.body.balance as number | undefined
        const newType = req.body.type as ACCOUNT_TYPE | undefined

        //se newbalance for diferente de undefined (ou seja, algum valor foi passado) entre dentro de outro if que verifica se o tipo do valor passado é number

        //fixação 1 validação do id
        //primeiro verifica se newId é undefine, se não for verifica se é uma string, depois se a string começa com a
        if (newId !== undefined) {
            if (typeof newId !== "string") {
                res.status(400)
                throw new Error("a id tem que ser uma string")
            }

            if (newId[0] !== "a") {
                res.status(400)
                throw new Error("a id deve começar com a letra a")
            }
        }

        //fixação 2 validação de ownerNAme
        //valida se o newOwnerName é diferente de undefined, se for verifica se é uma string, depois se tem 2 ou menos caracteres

        if (newOwnerName !== undefined) {
            if (typeof newOwnerName !== "string") {
                res.status(400)
                throw new Error("o newOwnername deve ser uma string")
            }

            
            if (newOwnerName.length < 2) {

                res.status(400)
                throw new Error("o owner name tem que possuir 2 carcteres ou mais")
            }
        }

        if (newBalance !== undefined) {
            // o "number" ta como string pq o typeof retorna o que é no formato de string
            if (typeof newBalance !== 'number') {
                res.status(400)
                throw new Error("Balance deve ser um numero")
            }

            if (newBalance < 0) {
                res.status(400)
                throw new Error("Balance tem que ser maior ou igual a 0")
            }
        }
        //verificação do newType
        if (newType !== undefined) {

            if (newType !== "Ouro" && newType !== "Platina" && newType !== "Black") {
                res.status(400)
                throw new Error("type deve ser uma catgoria valida")
            }

        }

        const account = accounts.find((account) => account.id === id)

        if (account) {
            account.id = newId || account.id
            account.ownerName = newOwnerName || account.ownerName
            account.type = newType || account.type

            account.balance = isNaN(newBalance) ? account.balance : newBalance


        }
        res.status(200).send("Atualização realizada com sucesso")

    } catch (err) {

        if (res.statusCode === 200) {
            res.status(500)
        }

        console.log(err)
        res.send(err.message)

    }


})