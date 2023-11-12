import { useForm, Controller, useFieldArray } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import Checkbox from '@mui/material/Checkbox';
import { FormControlLabel } from "@mui/material";

const schema = yup
  .object({
    firstName: yup.string().required(),
    isBig: yup.boolean(),
    age: yup.number(),
    eligibleGames : yup.object().shape({
      category: yup.string(),
      isAllGamesChecked: yup.bool(),
      games: yup.array().of(yup.object().shape({
        id: yup.string(),
        name: yup.string(),
        is_active: yup.boolean(),
      }))
    }),
    //example to create a condition for object validation. this uses another yup variables
    isSelectedGames: yup.bool().when(['eligibleGames.games', 'eligibleGames.category'], {
      is: (games, category) => {
        let someActive = false;
        games.forEach((item) => {
          if (item.is_active) {
            someActive = true;
          }
        });
        return someActive;
      }, 
      //if true, goes here
      then: (schema) => {
        return schema;
      },
      //if false, goes here
      otherwise: (schema) => {
        return yup.bool().oneOf([true], 'Field must be checked')
      },
    })
  })
  .required()

export default function App() {
  const {
    register,
    handleSubmit,
    control, 
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "Test",
      isBig: true,
      age: 5,
      eligibleGames: {
        category: "All Games", 
        isAllGamesChecked: false,
        games: [
          { id: "test1", name: "Game A", is_active: false },
          { id: "test2", name: "Game B", is_active: false },
          { id: "test3", name: "Game C", is_active: false },
          { id: "test4", name: "Game D", is_active: true },
        ]
      },
      isSelectedGames: false
    },
    resolver: yupResolver(schema),
  })

  //better solution to handle array in React Hooks form
  const {
    fields,
    replace,
    append
  } = useFieldArray({
    control,
    name: "eligibleGames.games"
  });

  const onSubmit = (data) => console.log("Success submit. Data : ", data);
  const onFailedSubmit = (data) => console.log("Failed submit. Data : ", data);

  return (
    <form onSubmit={handleSubmit(onSubmit, onFailedSubmit)}>
      <input {...register("firstName")} />
      <p>{errors.firstName?.message}</p>

      <input {...register("age")} />
      <p>{errors.age?.message}</p>

      <Controller
          name={`eligibleGames.isAllGamesChecked`}
          control={control}
          render={({ field, fieldState }) => {
            return (
              <FormControlLabel
                label={"Check All"}
                control={
                  <Checkbox
                    checked={field.value}
                    value={field.value}
                    // {...field}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      //replace array with some values
                      replace(fields.map((item) => {
                        return {
                          ...item,
                          is_active: checked
                        }
                      }))

                      field.onChange(checked);
                    }}
                  />
                }
              />
            )
          }}
        />
      
      {fields.map((item, index) => {
          //displaying the array to view
          return (
            <div key={item.id}> 
              {/* key has to be exist. it distinguishes all elements */}
              <Controller
                name={`eligibleGames.games.${index}`}
                control={control}
                render={({ field, fieldState }) => {
                  return (
                    <FormControlLabel
                      label={field.value.name}
                      control={
                        <Checkbox
                          {...field}
                          checked={field.value.is_active === true}
                          value={field.value.is_active === true}
                          
                          onChange={(e) => {
                            field.onChange({
                              name: field.value.name,
                              is_active: e.target.checked
                            })
                          }}
                        />
                      }
                    />
                  )
                }}
              />
            </div>
          );
      })}

      <button
          type="button"
          onClick={() => {
            
            replace(
              [
                {name: "Game A", is_active: true },
                {name: "Game B", is_active: true },
                {name: "Game C", is_active: true },
                {name: "Game D", is_active: true },
              ]
            )
          }}
      >
        replace
      </button>

      <button
          type="button"
          onClick={() => {
            
            append(
                {name: "Game E", is_active: true },
            )
          }}
      >
        append
      </button>
      
      {/* {JSON.stringify(fields)} */}

      <input type="submit" />
    </form>
  )
}