def rb_auth()
  require 'httpclient'
  
  c = HTTPClient.new
  c.debug_dev = STDOUT
  
  c.set_auth("https://api.github.com", "p4nther", "saterond2011")
  p c.get("http://api.github.com")
end