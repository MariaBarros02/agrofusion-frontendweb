import { useTranslation } from "react-i18next"


interface TitleTargetProps {
  title: string;
  description: string;
}
const TitleTarget = ({title, description}:TitleTargetProps )=> {
  const {t} = useTranslation();
  return (
    <div className='p-4 mb-3 bg-white border shadow-sm rounded-xl dark:bg-gray-700 dark:border-gray-600'>
       <h1 className='text-xl font-bold'>{t(title)} </h1>
       <p className='my-1 text-sm text-zinc-600 dark:text-gray-400'>{t(description)}</p>
    </div>

  )
}

export default TitleTarget