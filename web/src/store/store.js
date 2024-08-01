import globalStringValuesSlice from './globalStringValuesSlice'
import { configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
    reducer: {
        globalStringValues: globalStringValuesSlice,
    },
})
