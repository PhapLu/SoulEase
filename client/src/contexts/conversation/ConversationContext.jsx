import { useQuery, useQueryClient } from 'react-query'
import { createContext, useState, useContext } from 'react'
import { apiUtils } from '../../utils/newRequest.js'

const ConversationContext = createContext()

export const useConversation = () => {
    const context = useContext(ConversationContext)
    if (!context) {
        throw new Error('useConversation must be used within a ConversationProvider')
    }
    return context
}

export const ConversationProvider = ({ children }) => {
    const [showRenderConversations, setShowRenderConversations] = useState(false)
    const [unSeenConversations, setUnSeenConversations] = useState([])
    const queryClient = useQueryClient()

    // Active conversation
    const [conversationId, setConversationId] = useState()

    const fetchConversation = async () => {
        try {
            const response = await apiUtils.post(`/conversation/readOrCreateConversation`, {
                conversationId: conversationId,
            })
            return response.data.metadata.conversation
        } catch (error) {
            console.log(error)
        }
    }

    const { data: conversationData, error, isLoading } = useQuery(['fetchConversation', conversationId], fetchConversation, { enabled: !!conversationId })

    const openConversation = async (conversationId) => {
        setConversationId(conversationId)
        setShowRenderConversations(false)
    }

    // inside ConversationProvider, just below openConversation
    const openConversationWithUser = async (userId) => {
        try {
            const response = await apiUtils.post(`/conversation/readOrCreateConversation`, {
                otherUserId: userId,
            })
            const conversation = response.data.metadata.conversation
            setConversationId(conversation._id)
            setShowRenderConversations(false)
        } catch (error) {
            console.error('Failed to open conversation with user:', error)
        }
    }

    const value = {
        openConversation,
        openConversationWithUser,
        conversationData,
        conversationId,
        setConversationId,
        isLoading,
        error,
        unSeenConversations,
        setUnSeenConversations,
        showRenderConversations,
        setShowRenderConversations,
        // otherMember: otherMember || {}, // Provide default empty object
        // setOtherMember: handleSetOtherMember, Use the new function to set otherMember
        // conversation: conversation || {
        //     _id: "",
        //     otherMember: otherMember,
        //     messages: [],
        // }, Provide default empty object
        // showRenderConversation: showRenderConversation || false,
        // setShowRenderConversation,
        // showRenderConversations,
        // setShowRenderConversations,
        // isLoading: isLoading || false,
        // error: error || null,
        // unSeenConversations,
        // setUnSeenConversations,
    }

    return <ConversationContext.Provider value={value}>{children}</ConversationContext.Provider>

    // const [otherMember, setOtherMember] = useState();
    // const [showRenderConversation, setShowRenderConversation] = useState(false);
    // const [showRenderConversations, setShowRenderConversations] =
    //     useState(false);
    // const [conversationFetched, setConversationFetched] = useState(false);
    // const [unSeenConversations, setUnSeenConversations] = useState([]);
    // const queryClient = useQueryClient();

    // const {
    //     data: conversation,
    //     error,
    //     isLoading,
    // } = useQuery(
    //     ["fetchConversation", otherMember],
    //     () => fetchConversation(otherMember),
    //     {
    //         enabled: !!otherMember, // Only run query if otherMember is set
    //         onSuccess: () => {
    //             setConversationFetched(true);
    //         },
    //         onError: () => {
    //             setConversationFetched(false);
    //         },
    //     }
    // );

    // const handleSetOtherMember = (member) => {
    //     // Force reset otherMember to trigger useEffect
    //     setOtherMember(null);
    //     setTimeout(() => setOtherMember(member), 0); // Reset to the selected member after a short delay
    // };

    // useEffect(() => {
    //     if (otherMember) {
    //         setShowRenderConversation(false);
    //         setConversationFetched(false);
    //         queryClient.invalidateQueries(["fetchConversation", otherMember]);
    //     }
    // }, [otherMember, queryClient]);

    // useEffect(() => {
    //     if (conversationFetched) {
    //         setShowRenderConversation(true);
    //     }
    // }, [conversationFetched]);

    // const value = {
    //     otherMember: otherMember || {}, // Provide default empty object
    //     setOtherMember: handleSetOtherMember, // Use the new function to set otherMember
    //     conversation: conversation || {
    //         _id: "",
    //         otherMember: otherMember,
    //         messages: [],
    //     }, // Provide default empty object
    //     showRenderConversation: showRenderConversation || false,
    //     setShowRenderConversation,
    //     showRenderConversations,
    //     setShowRenderConversations,
    //     isLoading: isLoading || false,
    //     error: error || null,
    //     unSeenConversations,
    //     setUnSeenConversations,
    // };

    // return (
    //     <ConversationContext.Provider value={value}>
    //         {showRenderConversation && !isLoading && <RenderConversation />}
    //         {children}
    //     </ConversationContext.Provider>
    // );
}
