export default function PageLoadingScreen({ title = 'Loading...', subtitle = '', fullScreen = true }) {
  const outerClassName = fullScreen
    ? 'min-h-screen w-full bg-white flex items-center justify-center px-6 py-12'
    : 'w-full flex items-center justify-center px-6 py-12'

  const innerClassName = fullScreen
    ? 'text-center'
    : 'w-full max-w-2xl rounded-3xl border border-indigo-100 bg-white/90 px-8 py-12 text-center shadow-xl backdrop-blur'

  return (
    <div className={outerClassName}>
      <div className={innerClassName}>
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white">
          <div className="relative h-12 w-12">
            <span className="absolute inset-0 rounded-full border-4 border-gray-200" />
            <span className="absolute inset-0 rounded-full border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <span className="absolute inset-2 rounded-full border-4 border-r-violet-500 border-t-transparent border-b-transparent border-l-transparent animate-spin [animation-direction:reverse] [animation-duration:1.6s]" />
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{title}</h1>
        {subtitle ? <p className="mt-3 text-sm sm:text-base text-gray-600">{subtitle}</p> : null}
      </div>
    </div>
  )
}
