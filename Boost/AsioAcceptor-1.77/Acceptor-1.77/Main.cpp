//#include <thread>

#include <boost/asio/io_context.hpp>
#include <boost/asio/ip/tcp.hpp>

class Server : public std::enable_shared_from_this<Server>
{
    size_t m_ioThreadCount;
    //std::vector<std::thread> m_ioThreads;
    //boost::asio::io_context m_ioContext;
    //boost::asio::ip::tcp::acceptor m_acceptor;

    void OnAccept(boost::system::error_code ec, boost::asio::ip::tcp::socket socket);

public:
    Server(std::string&& address, uint16_t port, int concurrency = 1);
    //Server(uint16_t port, int concurrency = 1);

    //~Server();

    //void Accept();
    //void Start();
    //void Stop();
    //void Abort();//TODO: Remove?
};

#pragma region Server

Server::Server(std::string&& address, uint16_t port, int concurrency)
    : m_ioThreadCount { 1 }
{

}

#pragma endregion Server

// See example at https://www.boost.org/doc/libs/1_77_0/doc/html/boost_asio/reference/ip__tcp/acceptor.html
int main()
{
    boost::asio::io_context my_context{};
    int port = 1770;

    boost::asio::ip::tcp::acceptor acceptor(my_context);
    boost::asio::ip::tcp::endpoint endpoint(boost::asio::ip::tcp::v4(), port);
    acceptor.open(endpoint.protocol());
    acceptor.set_option(boost::asio::ip::tcp::acceptor::reuse_address(true));
    acceptor.bind(endpoint);
    acceptor.listen();

    auto server = std::make_shared<Server>("0.0.0.0", 1770, 1);
}
