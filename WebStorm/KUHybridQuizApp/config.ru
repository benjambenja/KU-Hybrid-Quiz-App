use Rack::Static,
  :urls => ["/images", "/js", "/css", "/templates"],
  :root => "KUHybridQuizApp"

run lambda { |env|
  [
    200,
    {
      'Content-Type'  => 'text/html',
      'Cache-Control' => 'public, max-age=86400'
    },
    File.open('KUHyrbridQuizApp/index.html', File::RDONLY)
  ]
}