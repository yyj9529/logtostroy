import InputForm from '@/components/InputForm'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24">
      <div className="max-w-3xl w-full">
        <h1 className="text-4xl font-bold text-center mb-4">LogToStory</h1>
        <p className="text-lg text-center text-gray-600 mb-8">
          Transform your raw logs into share-ready technical posts
        </p>

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <InputForm />
        </div>
      </div>
    </main>
  )
}
