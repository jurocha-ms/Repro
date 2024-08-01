#include <boost/asio/io_context.hpp>
#include <boost/asio/ip/tcp.hpp>

// See example at https://www.boost.org/doc/libs/1_76_0/doc/html/boost_asio/reference/ip__tcp/acceptor.html
int main()
{
    boost::asio::io_context my_context{};
    int port = 1760;

    boost::asio::ip::tcp::acceptor acceptor(my_context);
    boost::asio::ip::tcp::endpoint endpoint(boost::asio::ip::tcp::v4(), port);
    acceptor.open(endpoint.protocol());
    acceptor.set_option(boost::asio::ip::tcp::acceptor::reuse_address(true));
    acceptor.bind(endpoint);
    acceptor.listen();
}
