import {createSlice} from "@reduxjs/toolkit";

interface IUserState {
    token?: string,
    email?: string,
    name?: string,
    isLogged: boolean;
    isAdminster: boolean;
}

const userReduce = createSlice({
    name: "user",
    initialState: {
        isLogged: false,
        isAdminster: false
    } as unknown as IUserState, 
    reducers: {
        setUser(state, action){
            Object.assign(state,{
                token: action.payload.token,
                email: action.payload.email,
                name: action.payload.nome,
                isLogged: true,

            });
        },

        removeUser(state, action) {
            Object.assign(state, {
                token: undefined,
                email: undefined,
                nome: undefined,
                isLogged: false,
            })
        }
    },
});

export const {setUser, removeUser} = userReduce.actions;
export default userReduce.reducer;